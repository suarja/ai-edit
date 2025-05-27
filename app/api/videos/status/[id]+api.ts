import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing request ID' }), {
        status: 400,
      });
    }

    // Get video request status
    const { data: videoRequest, error } = await supabase
      .from('video_requests')
      .select(
        `
        id,
        render_status,
        render_url,
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return Response.json(videoRequest);
  } catch (error) {
    console.error('Error checking video status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check video status' }),
      { status: 500 }
    );
  }
}
