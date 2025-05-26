import { supabase } from '@/lib/supabase';
import { marked } from 'marked';

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
    
    // Log request headers
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

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

    // Create initial script record
    console.log('Creating script record...');
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        raw_prompt: prompt,
        status: 'draft',
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

    // Generate script using GPT-4
    console.log('Generating script with GPT-4...');
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a creative script-writing agent specialized in short-form video content.
            Generate concise, engaging scripts optimized for TikTok-style videos (30-60 seconds).
            
            Editorial Profile:
            - Persona: ${editorialProfile.persona_description}
            - Tone: ${editorialProfile.tone_of_voice}
            - Audience: ${editorialProfile.audience}
            - Style: ${editorialProfile.style_notes}
            
            Format the script in clear, spoken sentences suitable for text-to-speech.
            Focus on maintaining the creator's unique voice and style.`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!completion.ok) {
      console.error('GPT-4 API error:', await completion.text());
      throw new Error('Failed to generate script');
    }

    const completionData = await completion.json();
    console.log('Script generated successfully');

    const generatedScript = completionData.choices[0].message.content;

    // Update script with generated content
    console.log('Updating script with generated content...');
    const { error: updateError } = await supabase
      .from('scripts')
      .update({
        generated_script: generatedScript,
        status: 'validated',
      })
      .eq('id', script.id);

    if (updateError) {
      console.error('Script update error:', updateError);
      throw updateError;
    }

    // Load Creatomate template
    console.log('Loading video template...');
    const docsPath = '/docs/creatomate.md';
    const docsResponse = await fetch(docsPath);
    if (!docsResponse.ok) {
      console.error('Template load error:', await docsResponse.text());
      throw new Error('Failed to load video template');
    }
    const template = await docsResponse.json();
    console.log('Template loaded successfully');

    // Generate video using Creatomate
    console.log('Starting Creatomate render...');
    const renderResponse = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: process.env.CREATOMATE_TEMPLATE_ID,
        modifications: {
          script: generatedScript,
          selectedVideos,
          voiceId,
        },
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