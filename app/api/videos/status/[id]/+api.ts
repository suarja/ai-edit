import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return Response.json({ error: 'Missing request ID' }, { status: 400 });
    }

    // Get video request status
    const { data: videoRequest, error } = await supabase
      .from('video_requests')
      .select(
        `
        id,
        render_status,
        render_url,
        script_id
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return Response.json(videoRequest);
  } catch (error) {
    console.error('Error checking video status:', error);
    return Response.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
