import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ScriptGenerator } from '@/lib/agents/scriptGenerator';
import { ScriptReviewer } from '@/lib/agents/scriptReviewer';
import { CreatomateBuilder } from '@/lib/agents/creatomateBuilder';
import { MODELS } from '@/lib/config/openai';
import { EditorialProfile, VideoGenerationPayload } from './validation';
import { PromptService } from '@/lib/services/prompts';
import { convertCaptionConfigToCreatomate } from '@/lib/utils/video/caption-converter';

/**
 * Result of video generation process
 */
export type VideoGenerationResult = {
  requestId: string;
  scriptId: string;
  renderId: string;
};

/**
 * Video generation service
 */
export class VideoGeneratorService {
  private user: User;
  private scriptGenerator: ScriptGenerator;
  private scriptReviewer: ScriptReviewer;
  private creatomateBuilder: CreatomateBuilder;

  /**
   * Create a new video generator service instance
   * @param user The authenticated user
   */
  constructor(user: User) {
    this.user = user;
    this.scriptGenerator = ScriptGenerator.getInstance(MODELS['o4-mini']);
    this.scriptReviewer = ScriptReviewer.getInstance(MODELS['o4-mini']);
    this.creatomateBuilder = CreatomateBuilder.getInstance(MODELS['4.1']);
  }

  /**
   * Generates a video from the provided payload
   * @param payload The video generation payload
   * @returns The result of the video generation process
   */
  async generateVideo(
    payload: VideoGenerationPayload
  ): Promise<VideoGenerationResult> {
    const {
      prompt,
      systemPrompt,
      selectedVideos,
      editorialProfile,
      voiceId,
      captionConfig,
    } = payload;

    // Step 1: Generate and review script
    const { scriptId, reviewedScript } = await this.generateAndSaveScript(
      prompt,
      systemPrompt,
      editorialProfile
    );

    // Step 2: Create video request record
    const videoRequest = await this.createVideoRequest(
      scriptId,
      selectedVideos,
      captionConfig
    );

    // Step 3: Fetch and validate videos
    const videosObj = await this.fetchAndValidateVideos(selectedVideos);

    // Step 4: Generate Creatomate template
    const template = await this.generateTemplate(
      reviewedScript,
      videosObj,
      voiceId,
      editorialProfile,
      captionConfig
    );

    // Step 5: Store training data
    await this.storeTrainingData(
      prompt,
      reviewedScript,
      template,
      videoRequest.id
    );

    // Step 6: Start Creatomate render
    const renderId = await this.startCreatomateRender(
      template,
      videoRequest.id,
      scriptId,
      prompt
    );

    // Step 7: Update video request with render ID
    await this.updateVideoRequestStatus(videoRequest.id, renderId);

    // Return result
    return {
      requestId: videoRequest.id,
      scriptId,
      renderId,
    };
  }

  /**
   * Generates and saves a script
   * @private
   */
  private async generateAndSaveScript(
    prompt: string,
    systemPrompt: string,
    editorialProfile: EditorialProfile
  ): Promise<{ scriptId: string; reviewedScript: string }> {
    console.log('Generating script...');
    const generatedScript = await this.scriptGenerator.generate(
      prompt,
      editorialProfile,
      systemPrompt
    );
    console.log('Script generated successfully');

    console.log('Reviewing script...');
    const reviewedScript = await this.scriptReviewer.review(
      generatedScript,
      editorialProfile,
      `System Prompt from the user:
      ${systemPrompt}

      User Prompt:
      ${prompt}
      `
    );
    console.log('Script reviewed successfully');

    console.log('Creating script record...');
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: this.user.id,
        raw_prompt: prompt,
        generated_script: reviewedScript,
        status: 'validated',
      })
      .select()
      .single();

    if (scriptError) {
      console.error('Script creation error:', scriptError);
      throw scriptError;
    }

    console.log('Script created:', script.id);
    return { scriptId: script.id, reviewedScript };
  }

  /**
   * Creates a video request record
   * @private
   */
  private async createVideoRequest(
    scriptId: string,
    selectedVideos: any[],
    captionConfig?: any
  ): Promise<{ id: string }> {
    console.log('Creating video request...');
    const { data, error } = await supabase
      .from('video_requests')
      .insert({
        user_id: this.user.id,
        script_id: scriptId,
        selected_videos: selectedVideos.map((v) => v.id),
        render_status: 'queued',
        caption_config: captionConfig || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Video request creation error:', error);
      throw error;
    }

    console.log('Video request created:', data.id);
    return { id: data.id };
  }

  /**
   * Fetches and validates videos
   * @private
   */
  private async fetchAndValidateVideos(selectedVideos: any[]): Promise<any[]> {
    console.log('Fetching video data...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, upload_url, title, description, tags')
      .in(
        'id',
        selectedVideos.map((v) => v.id)
      );

    if (videosError) {
      console.error('Error fetching videos:', videosError);
      throw videosError;
    }

    // Validate videos have upload URLs
    return videos.map((video) => {
      if (!video.upload_url) {
        throw new Error(`Missing upload URL for video ${video.id}`);
      }

      return {
        id: video.id,
        url: video.upload_url,
        title: video.title || '',
        description: video.description || '',
        tags: video.tags || [],
      };
    });
  }

  /**
   * Generates a Creatomate template
   * @private
   */
  private async generateTemplate(
    script: string,
    selectedVideos: any[],
    voiceId: string,
    editorialProfile: EditorialProfile,
    captionConfig?: any
  ): Promise<any> {
    console.log('Generating video template...');

    // Get the video-creatomate-agent prompt from the prompt bank
    const promptTemplate = PromptService.fillPromptTemplate(
      'video-creatomate-agent',
      {
        prompt: script,
        systemPrompt:
          'Generate a compelling video with specified caption styles',
        editorialProfile,
        captionConfig: captionConfig || 'Default captions',
      }
    );

    if (!promptTemplate) {
      console.warn('Prompt template not found, using default template');
    }

    // Convert caption configuration to Creatomate format
    const captionStructure = convertCaptionConfigToCreatomate(captionConfig);

    // Build the template with the agent
    const template = await this.creatomateBuilder.buildJson({
      script,
      selectedVideos,
      voiceId,
      editorialProfile,
      captionStructure,
      agentPrompt: promptTemplate?.system,
    });

    console.log('Template generated successfully');
    return template;
  }

  /**
   * Stores training data
   * @private
   */
  private async storeTrainingData(
    prompt: string,
    script: string,
    template: any,
    videoRequestId: string
  ): Promise<void> {
    console.log('Storing training data...');
    try {
      const { error } = await supabase.from('rl_training_data').insert({
        user_id: this.user.id,
        raw_prompt: prompt,
        generated_script: script,
        creatomate_template: template,
        video_request_id: videoRequestId,
      });

      if (error) {
        console.error('Error storing training data:', error);
        // Don't throw, just log the error and continue
      }
    } catch (error) {
      console.error('Error storing training data:', error);
      // Don't throw, continue with the process
    }
  }

  /**
   * Starts a Creatomate render
   * @private
   */
  private async startCreatomateRender(
    template: any,
    requestId: string,
    scriptId: string,
    prompt: string
  ): Promise<string> {
    console.log('Starting Creatomate render...');

    // Get the server's base URL for webhook callbacks
    const baseUrl =
      process.env.EXPO_PUBLIC_SERVER_URL || 'https://your-production-url.com';

    // Create webhook URL for render status updates
    const webhookUrl = `${baseUrl}/api/webhooks/creatomate`;

    const renderResponse = await fetch(
      'https://api.creatomate.com/v1/renders',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: 'a5403674-6eaf-4114-a088-4d560d851aef',
          modifications: template,
          webhook_url: webhookUrl,
          output_format: 'mp4',
          frame_rate: 30,
          render_scale: 1.0,
          metadata: JSON.stringify({
            requestId,
            userId: this.user.id,
            scriptId,
            prompt: prompt.substring(0, 100), // Truncate long prompts
            timestamp: new Date().toISOString(),
          }),
        }),
      }
    );

    if (!renderResponse.ok) {
      const errorData = await renderResponse.json();
      console.error('Creatomate API error:', errorData);
      throw new Error('Failed to start render');
    }

    const renderData = await renderResponse.json();
    const renderId = renderData[0]?.id;

    if (!renderId) {
      throw new Error('Invalid response from Creatomate API');
    }

    console.log('Render started:', renderId);
    return renderId;
  }

  /**
   * Updates the video request status
   * @private
   */
  private async updateVideoRequestStatus(
    requestId: string,
    renderId: string
  ): Promise<void> {
    console.log('Updating video request with render ID...');
    const { error } = await supabase
      .from('video_requests')
      .update({
        render_status: 'rendering',
        render_id: renderId,
      })
      .eq('id', requestId);

    if (error) {
      console.error('Request update error:', error);
      throw error;
    }
  }
}
