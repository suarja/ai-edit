import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return Response.json({ error: 'Missing request ID' }, { status: 400 });
    }
    console.log('id- +api', id);

    // Get video request status from database
    const { data: videoRequest, error } = await supabase
      .from('video_requests')
      .select(
        `
        id,
        render_status,
        render_url,
        render_id,
        script_id
      `
      )
      .eq('id', id)
      .single();

    console.log('videoRequest- +api', videoRequest);
    if (error) throw error;

    // If the video is still rendering, check Creatomate status
    if (videoRequest.render_status === 'rendering' && videoRequest.render_id) {
      try {
        // Check Creatomate status
        const url = `https://api.creatomate.com/v1/renders/${videoRequest.render_id}`;
        console.log('url- +api', url);
        const renderResponse = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
          },
        });
        console.log('renderResponse- +api', renderResponse);

        if (renderResponse.ok) {
          const renderData = await renderResponse.json();
          console.log('Creatomate render status:', renderData.status);

          // Update database based on Creatomate status
          if (renderData.status === 'succeeded') {
            const { error: updateError } = await supabase
              .from('video_requests')
              .update({
                render_status: 'done',
                render_url: renderData.url,
              })
              .eq('id', id);

            if (updateError) {
              console.error('Error updating video status:', updateError);
            } else {
              // Update the response object with the new status
              videoRequest.render_status = 'done';
              videoRequest.render_url = renderData.url;
            }
          } else if (renderData.status === 'failed') {
            const { error: updateError } = await supabase
              .from('video_requests')
              .update({
                render_status: 'error',
              })
              .eq('id', id);

            if (updateError) {
              console.error('Error updating video status:', updateError);
            } else {
              videoRequest.render_status = 'error';
            }
          }
          // If still 'rendering', no need to update
        } else {
          console.error(
            'Error checking Creatomate status:',
            await renderResponse.text()
          );
        }
      } catch (creatomateError) {
        console.error(
          'Error checking Creatomate render status:',
          creatomateError
        );
      }
    }

    return Response.json(videoRequest);
  } catch (error) {
    console.error('Error checking video status:', error);
    return Response.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
