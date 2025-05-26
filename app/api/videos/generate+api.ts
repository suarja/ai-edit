import { supabase } from '@/lib/supabase';
import { ScriptGenerator } from '@/lib/agents/scriptGenerator';
import { ScriptReviewer } from '@/lib/agents/scriptReviewer';
import { CreatomateBuilder } from '@/lib/agents/creatomateBuilder';
import { MODELS, MODEL } from '@/lib/config/openai';

export async function POST(request: Request) {
  try {
    console.log('Starting video generation request...');

    // Get auth token from request header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { prompt, selectedVideos, editorialProfile, voiceId } = body;

    // Validate required fields
    if (!prompt || !selectedVideos?.length) {
      console.log('Missing required fields:', { prompt, selectedVideos });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    if (!user) {
      console.log('No user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    console.log('User authenticated:', user.id);

    // Initialize agents
    const scriptGenerator = new ScriptGenerator(MODEL);
    const scriptReviewer = new ScriptReviewer(MODEL);
    const creatomateBuilder = CreatomateBuilder.getInstance(MODELS["4.1"]);

    // Generate initial script
    console.log('Generating script...');
    const generatedScript = await scriptGenerator.generate(prompt, editorialProfile);
    console.log('Script generated:', generatedScript);

    // Review and optimize script
    console.log('Reviewing script...');
    const reviewedScript = await scriptReviewer.review(generatedScript, editorialProfile);
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
        selected_videos: selectedVideos,
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
      selectedVideos,
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
        video_request_id: videoRequest.id
      });

    if (trainingError) {
      console.error('Error storing training data:', trainingError);
      // Don't throw, just log the error and continue
    }

    // Start Creatomate render
    console.log('Starting Creatomate render...');
    const renderResponse = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "template_id": "a5403674-6eaf-4114-a088-4d560d851aef",
        modifications: template
        
      }),
    });

    if (!renderResponse.ok) {
      console.error('Creatomate API error:', await renderResponse.text());
      throw new Error('Failed to start render');
    }

    const renderData = await renderResponse.json();
    console.log('Render started:', renderData.id);

    // Update request with render ID
    console.log('Updating video request with render ID...');
    const { error: updateRequestError } = await supabase
      .from('video_requests')
      .update({ 
        render_status: 'rendering',
        metadata: { 
          render_id: renderData.id,
          status: 'Render in progress...'
        }
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
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in video generation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process video request',
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}