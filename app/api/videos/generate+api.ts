import { supabase } from '@/lib/supabase';
import { ScriptGenerator } from '@/lib/agents/scriptGenerator';
import { ScriptReviewer } from '@/lib/agents/scriptReviewer';
import { CreatomateBuilder } from '@/lib/agents/creatomateBuilder';
import { MODELS } from '@/lib/config/openai';
import { VideoType } from '@/types/video';

// A Function to validate the request body and return a response with the missing fields
type EditorialProfile = {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

type Payload = {
  prompt: string;
  systemPrompt: string;
  selectedVideos: VideoType[];
  editorialProfile: EditorialProfile;
  voiceId: string;
};

// Using discriminated union for better type safety
type ValidationResponse =
  | { success: true; payload: Payload }
  | { success: false; error: Response };

export async function POST(request: Request) {
  try {
    console.log('Starting video generation request...');

    // Parse request body
    const requestBody = await request.json();

    // Validate request body
    const validationResult = validateRequestBody(requestBody);
    if (!validationResult.success) {
      return validationResult.error;
    }

    // Now we can safely destructure since we know the validation succeeded
    const { prompt, systemPrompt, selectedVideos, editorialProfile, voiceId } =
      validationResult.payload;

    // Get user from auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''));
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    if (!user) {
      console.log('No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    console.log('User authenticated:', user.id);

    // Fetch source videos with URLs
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, upload_url, title, description, tags')
      .in(
        'id',
        selectedVideos.map((v: any) => v.id)
      );

    if (videosError) {
      console.error('Error fetching videos:', videosError);
      throw videosError;
    }

    // Check if all videos have upload_urls
    const videosObj = videos.map((video: any) => {
      if (!video.upload_url) {
        throw new Error(`Missing upload URL for video ${video.id}`);
      }

      return {
        id: video.id,
        url: video.upload_url, // Using UploadThing URLs directly (already public)
        title: video.title,
        description: video.description,
        tags: video.tags,
      };
    });

    // Initialize agents
    const scriptGenerator = ScriptGenerator.getInstance(MODELS['o4-mini']);
    const scriptReviewer = ScriptReviewer.getInstance(MODELS['o4-mini']);
    const creatomateBuilder = CreatomateBuilder.getInstance(MODELS['4.1']);

    // Generate initial script
    console.log('Generating script...');
    const generatedScript = await scriptGenerator.generate(
      prompt,
      editorialProfile,
      systemPrompt
    );
    console.log('Script generated:', generatedScript);

    // Review and optimize script
    console.log('Reviewing script...');
    const reviewedScript = await scriptReviewer.review(
      generatedScript,
      editorialProfile,
      `System Prompt from the user:
      ${systemPrompt}

      User Prompt:
      ${prompt}
      `
    );
    console.log('Script reviewed:', reviewedScript);

    // Create initial script record
    console.log('Creating script record...');
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
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

    // Create video request record
    console.log('Creating video request...');
    const { data: videoRequest, error: requestError } = await supabase
      .from('video_requests')
      .insert({
        user_id: user.id,
        script_id: script.id,
        selected_videos: selectedVideos.map((v: any) => v.id),
        render_status: 'queued',
      })
      .select()
      .single();

    if (requestError) {
      console.error('Video request creation error:', requestError);
      throw requestError;
    }
    console.log('Video request created:', videoRequest.id);

    // Generate Creatomate template
    console.log('Generating video template...');
    const template = await creatomateBuilder.buildJson({
      script: reviewedScript,
      selectedVideos: videosObj, // Use UploadThing URLs
      voiceId,
      editorialProfile,
    });
    console.log('Template generated successfully');

    // Store training data
    console.log('Storing training data...');
    const { error: trainingError } = await supabase
      .from('rl_training_data')
      .insert({
        user_id: user.id,
        raw_prompt: prompt,
        generated_script: reviewedScript,
        creatomate_template: template,
        video_request_id: videoRequest.id,
      });

    if (trainingError) {
      console.error('Error storing training data:', trainingError);
      // Don't throw, just log the error and continue
    }

    // Start Creatomate render
    console.log('Starting Creatomate render...');

    // Get the server's base URL for webhook callbacks
    // In production, this should be your public-facing URL
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
          webhook_url: webhookUrl, // Add webhook URL for callbacks
          output_format: 'mp4', // Ensure we get MP4 output
          frame_rate: 30, // Use a standard frame rate
          render_scale: 1.0, // Full quality
          metadata: JSON.stringify({
            requestId: videoRequest.id,
            userId: user.id,
            scriptId: script.id,
            prompt: prompt.substring(0, 100), // Truncate long prompts
            timestamp: new Date().toISOString(),
          }),
        }),
      }
    );

    if (!renderResponse.ok) {
      console.error('Creatomate API error:', await renderResponse.json());
      throw new Error('Failed to start render');
    }

    const renderData = await renderResponse.json();
    const renderId = renderData.id;
    console.log('Render started:', renderData);
    console.log('Render started:', renderId);

    // Update request with render ID
    console.log('Updating video request with render ID...');
    const { error: updateRequestError } = await supabase
      .from('video_requests')
      .update({
        render_status: 'rendering',
        render_id: renderId,
      })
      .eq('id', videoRequest.id);

    if (updateRequestError) {
      console.error('Request update error:', updateRequestError);
      throw updateRequestError;
    }

    console.log('Video generation process completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        requestId: videoRequest.id,
        scriptId: script.id,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in video generation:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process video request',
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

function validateRequestBody(body: any): ValidationResponse {
  const { prompt, systemPrompt, selectedVideos, editorialProfile, voiceId } =
    body;

  if (!prompt || !selectedVideos?.length) {
    return {
      success: false,
      error: new Response(
        JSON.stringify({
          error: 'Missing required fields',
          missing: {
            prompt: !prompt,
            selectedVideos: !selectedVideos,
            systemPrompt: !systemPrompt,
            editorialProfile: !editorialProfile,
            voiceId: !voiceId,
          },
        }),
        { status: 400 }
      ),
    };
  }
  return {
    success: true,
    payload: {
      prompt,
      systemPrompt,
      selectedVideos,
      editorialProfile,
      voiceId,
    },
  };
}
