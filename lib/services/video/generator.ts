import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ScriptGenerator } from '@/lib/agents/scriptGenerator';
import { ScriptReviewer } from '@/lib/agents/scriptReviewer';
import { CreatomateBuilder } from '@/lib/agents/creatomateBuilder';
import { MODELS } from '@/lib/config/openai';
import {
  EditorialProfile,
  VideoGenerationPayload,
  VideoValidationService,
} from './validation';
import { VideoGenerationResult, ValidatedVideo } from '@/types/video';
import { PromptService } from '@/lib/services/prompts';
import { convertCaptionConfigToCreatomate } from '@/lib/utils/video/caption-converter';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';

/**
 * Enhanced video generation service with better error handling and performance
 */
export class VideoGeneratorService {
  private user: User;
  private scriptGenerator: ScriptGenerator;
  private scriptReviewer: ScriptReviewer;
  private creatomateBuilder: CreatomateBuilder;

  // Timeout configurations
  private static readonly SCRIPT_GENERATION_TIMEOUT = 120000; // 60 seconds
  private static readonly CREATOMATE_API_TIMEOUT = 120000; // 2 minutes
  private static readonly DATABASE_OPERATION_TIMEOUT = 30000; // 30 seconds

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
   * Generates a video from the provided payload with comprehensive error handling
   * @param payload The video generation payload
   * @returns The result of the video generation process
   * @throws VideoGenerationError for any failures
   */
  async generateVideo(
    payload: VideoGenerationPayload
  ): Promise<VideoGenerationResult> {
    const startTime = Date.now();
    let scriptId: string | null = null;
    let videoRequestId: string | null = null;

    try {
      const {
        prompt,
        systemPrompt,
        selectedVideos,
        editorialProfile,
        voiceId,
        captionConfig,
        outputLanguage,
      } = payload;

      console.log(`🎬 Starting video generation for user ${this.user.id}`);

      // Step 1: Generate and review script with timeout
      const { scriptId: generatedScriptId, reviewedScript } =
        await this.withTimeout(
          this.generateAndSaveScript(
            prompt,
            systemPrompt,
            editorialProfile,
            outputLanguage
          ),
          VideoGeneratorService.SCRIPT_GENERATION_TIMEOUT,
          'Script generation timed out'
        );
      scriptId = generatedScriptId;

      // Step 2: Create video request record
      const videoRequest = await this.withTimeout(
        this.createVideoRequest(
          scriptId,
          selectedVideos,
          captionConfig,
          outputLanguage
        ),
        VideoGeneratorService.DATABASE_OPERATION_TIMEOUT,
        'Database operation timed out'
      );
      videoRequestId = videoRequest.id;

      // Step 3: Fetch and validate videos (can be done in parallel with template generation)
      const videosValidation = await this.withTimeout(
        this.fetchAndValidateVideos(selectedVideos),
        VideoGeneratorService.DATABASE_OPERATION_TIMEOUT,
        'Video validation timed out'
      );

      // Step 4: Generate Creatomate template (start in parallel)
      const template = await this.withTimeout(
        this.generateTemplate(
          reviewedScript,
          videosValidation,
          voiceId,
          editorialProfile,
          captionConfig,
          outputLanguage
        ),
        VideoGeneratorService.SCRIPT_GENERATION_TIMEOUT,
        'Template generation timed out'
      );

      // Step 5: Store training data (fire and forget - don't block on failures)
      this.storeTrainingDataAsync(
        prompt,
        reviewedScript,
        template,
        videoRequest.id
      ).catch((error) => console.warn('Training data storage failed:', error));

      // Step 6: Start Creatomate render with timeout
      const renderId = await this.withTimeout(
        this.startCreatomateRender(template, videoRequest.id, scriptId, prompt),
        VideoGeneratorService.CREATOMATE_API_TIMEOUT,
        'Creatomate render start timed out'
      );

      // Step 7: Update video request with render ID
      await this.withTimeout(
        this.updateVideoRequestStatus(videoRequest.id, renderId),
        VideoGeneratorService.DATABASE_OPERATION_TIMEOUT,
        'Status update timed out'
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Video generation completed in ${duration}ms`);

      // Return result with enhanced status
      return {
        requestId: videoRequest.id,
        scriptId,
        renderId,
        status: 'queued',
        estimatedCompletionTime: new Date(Date.now() + 300000), // 5 minutes estimate
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Video generation failed after ${duration}ms:`, error);

      // Attempt cleanup on failure
      await this.cleanupOnFailure(scriptId, videoRequestId);

      // Transform and re-throw as VideoGenerationError
      if (error instanceof Error && 'code' in error) {
        throw error; // Already a VideoGenerationError
      }

      throw VideoValidationService.createError(
        error instanceof Error
          ? error.message
          : 'Unknown error during video generation',
        'VIDEO_GENERATION_FAILED',
        {
          userId: this.user.id,
          duration,
          originalError: error instanceof Error ? error.message : error,
        },
        true, // Retryable
        'Video generation failed. Please try again.'
      );
    }
  }

  /**
   * Wraps a promise with a timeout
   * @private
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error = VideoValidationService.createError(
          timeoutMessage,
          'OPERATION_TIMEOUT',
          { timeoutMs },
          true,
          'The operation took too long to complete. Please try again.'
        );
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Generates and saves a script with language support
   * @private
   */
  private async generateAndSaveScript(
    prompt: string,
    systemPrompt: string,
    editorialProfile: EditorialProfile,
    outputLanguage: string
  ): Promise<{ scriptId: string; reviewedScript: string }> {
    try {
      console.log('🤖 Generating script...');
      const generatedScript = await this.scriptGenerator.generate(
        prompt,
        editorialProfile,
        systemPrompt
      );
      console.log('✅ Script generated successfully', { generatedScript });

      console.log('🔍 Reviewing script...');
      const reviewedScript = await this.scriptReviewer.review(
        generatedScript,
        editorialProfile,
        `System Prompt from the user:
        ${systemPrompt}

        User Prompt:
        ${prompt}
        
        Output Language: ${outputLanguage}
        `
      );
      console.log('✅ Script reviewed successfully', { reviewedScript });

      console.log('💾 Creating script record...');
      const { data: script, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          user_id: this.user.id,
          raw_prompt: prompt,
          generated_script: reviewedScript,
          status: 'validated',
          output_language: outputLanguage,
        })
        .select()
        .single();

      if (scriptError) {
        throw VideoValidationService.createError(
          'Failed to save script to database',
          'SCRIPT_SAVE_ERROR',
          { originalError: scriptError },
          true,
          'Failed to save the generated script. Please try again.'
        );
      }

      console.log(`✅ Script created: ${script.id}`);
      return { scriptId: script.id, reviewedScript };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw VideoGenerationError
      }

      throw VideoValidationService.createError(
        'Script generation failed',
        'SCRIPT_GENERATION_ERROR',
        { originalError: error },
        true,
        'Failed to generate the video script. Please try again.'
      );
    }
  }

  /**
   * Creates a video request record with better error handling
   * @private
   */
  private async createVideoRequest(
    scriptId: string,
    selectedVideos: any[],
    captionConfig?: any,
    outputLanguage?: string
  ): Promise<{ id: string }> {
    try {
      console.log('📋 Creating video request...');
      const { data, error } = await supabase
        .from('video_requests')
        .insert({
          user_id: this.user.id,
          script_id: scriptId,
          selected_videos: selectedVideos.map((v) => v.id),
          render_status: 'queued',
          output_language: outputLanguage || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw VideoValidationService.createError(
          'Failed to create video request',
          'VIDEO_REQUEST_CREATE_ERROR',
          { originalError: error },
          true,
          'Failed to create video request. Please try again.'
        );
      }

      console.log(`✅ Video request created: ${data.id}`);
      return { id: data.id };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }

      throw VideoValidationService.createError(
        'Video request creation failed',
        'VIDEO_REQUEST_ERROR',
        { originalError: error },
        true,
        'Failed to create video request. Please try again.'
      );
    }
  }

  /**
   * Fetches and validates videos with improved error handling
   * @private
   */
  private async fetchAndValidateVideos(
    selectedVideos: any[]
  ): Promise<ValidatedVideo[]> {
    try {
      console.log('🎥 Fetching video data...');
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, upload_url, title, description, tags')
        .in(
          'id',
          selectedVideos.map((v) => v.id)
        );

      if (videosError) {
        throw VideoValidationService.createError(
          'Failed to fetch video data',
          'VIDEO_FETCH_ERROR',
          { originalError: videosError },
          true,
          'Failed to retrieve video information. Please try again.'
        );
      }

      if (!videos || videos.length === 0) {
        throw VideoValidationService.createError(
          'No videos found for the provided IDs',
          'VIDEOS_NOT_FOUND',
          { requestedIds: selectedVideos.map((v) => v.id) },
          false,
          'The selected videos could not be found. Please select different videos.'
        );
      }

      // Use the enhanced validation service
      const validatedVideos = VideoValidationService.validateVideos(
        videos.map((video) => ({
          ...video,
          user_id: video.user_id || this.user.id,
          created_at: video.created_at || new Date().toISOString(),
          updated_at: video.updated_at || new Date().toISOString(),
        }))
      );
      console.log(`✅ Validated ${validatedVideos.length} videos`);

      return validatedVideos;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }

      throw VideoValidationService.createError(
        'Video validation failed',
        'VIDEO_VALIDATION_ERROR',
        { originalError: error },
        true,
        'Failed to validate videos. Please try again.'
      );
    }
  }

  /**
   * Generates a Creatomate template with language support
   * @private
   */
  private async generateTemplate(
    script: string,
    selectedVideos: ValidatedVideo[],
    voiceId: string,
    editorialProfile: EditorialProfile,
    captionConfig?: any,
    outputLanguage?: string
  ): Promise<any> {
    try {
      console.log('🎨 Generating video template...');

      // Get the enhanced video-creatomate-agent-v2 prompt from the prompt bank
      let promptTemplate = PromptService.fillPromptTemplate(
        'video-creatomate-agent-v2',
        {
          prompt: script,
          systemPrompt:
            'Generate a compelling video with specified caption styles',
          editorialProfile,
          captionConfig: captionConfig || 'Default captions',
          outputLanguage: outputLanguage || 'fr',
        }
      );

      console.log('🔍 Prompt template:', {
        promptTemplate: JSON.stringify(promptTemplate, null, 2),
      });

      // Convert caption configuration to Creatomate format
      const captionStructure = convertCaptionConfigToCreatomate(captionConfig);
      console.log('🔍 Caption structure:', {
        captionStructure: JSON.stringify(captionStructure, null, 2),
      });
      // Build the template with the agent
      console.log('🔍 Starting template generation with builder agent...');

      try {
        const template = await this.creatomateBuilder.buildJson({
          script,
          selectedVideos,
          voiceId,
          editorialProfile,
          captionStructure,
          agentPrompt: promptTemplate?.system,
        });

        // Log template dimensions to verify
        console.log(
          `✅ Template generated successfully with dimensions: ${template.width}x${template.height}`
        );
        console.log('📐 Template root properties:', {
          output_format: template.output_format,
          width: template.width,
          height: template.height,
          elements_count: template.elements?.length || 0,
        });

        console.log('🔍 Template:', {
          template: JSON.stringify(template, null, 2),
        });
        return template;
      } catch (error) {
        console.error('❌ Template generation error:', error);

        // Add more detailed error for debugging
        const errorMessage =
          error instanceof Error
            ? `${error.message}${error.stack ? `\nStack: ${error.stack}` : ''}`
            : String(error);

        throw VideoValidationService.createError(
          `Template generation failed: ${errorMessage}`,
          'TEMPLATE_GENERATION_ERROR',
          { originalError: error },
          true,
          'Failed to generate video template. Please try again.'
        );
      }
    } catch (error) {
      throw VideoValidationService.createError(
        'Template generation failed',
        'TEMPLATE_GENERATION_ERROR',
        { originalError: error },
        true,
        'Failed to generate video template. Please try again.'
      );
    }
  }

  /**
   * Stores training data asynchronously (non-blocking)
   * @private
   */
  private async storeTrainingDataAsync(
    prompt: string,
    script: string,
    template: any,
    videoRequestId: string
  ): Promise<void> {
    try {
      console.log('💾 Storing training data...');
      const { error } = await supabase.from('rl_training_data').insert({
        user_id: this.user.id,
        raw_prompt: prompt,
        generated_script: script,
        creatomate_template: template,
        video_request_id: videoRequestId,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('⚠️ Training data storage failed:', error);
      } else {
        console.log('✅ Training data stored successfully');
      }
    } catch (error) {
      console.warn('⚠️ Training data storage failed:', error);
    }
  }

  /**
   * Starts a Creatomate render with enhanced error handling
   * @private
   */
  private async startCreatomateRender(
    template: any,
    requestId: string,
    scriptId: string,
    prompt: string
  ): Promise<string> {
    try {
      console.log('🚀 Starting Creatomate render...');

      // Get the server's base URL for webhook callbacks
      const baseUrl =
        process.env.EXPO_PUBLIC_SERVER_URL || 'https://ai-edit.expo.app';
      const webhookUrl = `${baseUrl}/api/webhooks/creatomate`;

      const renderPayload = {
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
      };

      const renderResponse = await fetch(API_ENDPOINTS.CREATOMATE_RENDER(), {
        method: 'POST',
        headers: API_HEADERS.CREATOMATE_AUTH,
        body: JSON.stringify(renderPayload),
      });

      if (!renderResponse.ok) {
        const errorData = await renderResponse.json().catch(() => ({}));

        throw VideoValidationService.createError(
          'Creatomate API request failed',
          'CREATOMATE_API_ERROR',
          {
            status: renderResponse.status,
            statusText: renderResponse.statusText,
            errorData,
          },
          renderResponse.status >= 500, // Retry on server errors
          'Video rendering service is temporarily unavailable. Please try again.'
        );
      }

      const renderData = await renderResponse.json();
      const renderId = renderData[0]?.id;

      if (!renderId) {
        throw VideoValidationService.createError(
          'Invalid response from Creatomate API',
          'CREATOMATE_INVALID_RESPONSE',
          { renderData },
          true,
          'Video rendering service returned an invalid response. Please try again.'
        );
      }

      console.log(`✅ Render started: ${renderId}`);
      return renderId;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }

      throw VideoValidationService.createError(
        'Failed to start render',
        'RENDER_START_ERROR',
        { originalError: error },
        true,
        'Failed to start video rendering. Please try again.'
      );
    }
  }

  /**
   * Updates the video request status with better error handling
   * @private
   */
  private async updateVideoRequestStatus(
    requestId: string,
    renderId: string
  ): Promise<void> {
    try {
      console.log('📝 Updating video request with render ID...');
      const { error } = await supabase
        .from('video_requests')
        .update({
          render_status: 'rendering',
          render_id: renderId,
        })
        .eq('id', requestId);

      if (error) {
        throw VideoValidationService.createError(
          'Failed to update video request status',
          'STATUS_UPDATE_ERROR',
          { originalError: error },
          true,
          'Failed to update request status. The video is processing but status may not reflect correctly.'
        );
      }

      console.log('✅ Video request status updated');
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }

      throw VideoValidationService.createError(
        'Status update failed',
        'UPDATE_FAILED',
        { originalError: error },
        true,
        'Failed to update request status.'
      );
    }
  }

  /**
   * Cleanup resources on failure
   * @private
   */
  private async cleanupOnFailure(
    scriptId: string | null,
    videoRequestId: string | null
  ): Promise<void> {
    try {
      console.log('🧹 Performing cleanup after failure...');

      const cleanupPromises: Promise<any>[] = [];

      if (videoRequestId) {
        cleanupPromises.push(
          supabase
            .from('video_requests')
            .update({
              render_status: 'failed',
            })
            .eq('id', videoRequestId)
            .then() as Promise<any>
        );
      }

      if (scriptId) {
        cleanupPromises.push(
          supabase
            .from('scripts')
            .update({
              status: 'failed',
            })
            .eq('id', scriptId)
            .then() as Promise<any>
        );
      }

      await Promise.allSettled(cleanupPromises);
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error);
    }
  }
}
