import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('Starting video generation request...');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { prompt, selectedVideos, editorialProfile, voiceId } = body;

    // Validate required fields
    if (!prompt || !selectedVideos?.length) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create initial script record
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        raw_prompt: prompt,
        status: 'draft',
      })
      .select()
      .single();

    if (scriptError) throw scriptError;

    // Create video request record
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

    if (requestError) throw requestError;

    // Return success response
    return Response.json({ 
      success: true,
      requestId: videoRequest.id,
      scriptId: script.id,
    });
  } catch (error) {
    console.error('Error in video generation:', error);
    return Response.json({ 
      error: error.message || 'Failed to process video request',
      stack: error.stack
    }, { 
      status: 500 
    });
  }
}