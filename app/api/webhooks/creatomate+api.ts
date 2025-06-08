import { supabase } from '@/lib/supabase';

interface CreatomateWebhookData {
  id: string; // Render ID
  status: string; // 'succeeded', 'failed', or other status
  url?: string; // URL of the rendered video (if succeeded)
  snapshot_url?: string; // URL of the thumbnail (if succeeded)
  template_id?: string; // ID of the template used
  output_format?: string; // Output format (mp4, jpg, etc.)
  width?: number; // Width of the rendered video
  height?: number; // Height of the rendered video
  frame_rate?: number; // Frame rate of the video
  duration?: number; // Duration in seconds
  file_size?: number; // File size in bytes
  metadata?: string; // String containing JSON metadata
  error?: string; // Error message if failed
}

interface RenderMetadata {
  requestId: string;
  userId: string;
  scriptId?: string;
  prompt?: string;
  timestamp?: string;
}

// Webhook endpoint for Creatomate render status updates
export async function POST(request: Request) {
  try {
    // Parse webhook payload
    const webhookData: CreatomateWebhookData = await request.json();
    console.log(
      'Received webhook from Creatomate:',
      JSON.stringify({
        id: webhookData.id,
        status: webhookData.status,
        hasUrl: !!webhookData.url,
        hasMetadata: !!webhookData.metadata,
      })
    );

    // Parse metadata from string to object
    let metadata: RenderMetadata;
    try {
      metadata = webhookData.metadata ? JSON.parse(webhookData.metadata) : {};
    } catch (parseError) {
      console.error('Error parsing metadata:', parseError);
      return Response.json(
        { error: 'Invalid metadata format' },
        { status: 400 }
      );
    }

    const { requestId, userId } = metadata;

    // Validate required fields
    if (!requestId || !userId) {
      console.error('Missing required metadata fields:', metadata);
      return Response.json(
        { error: 'Missing required metadata fields' },
        { status: 400 }
      );
    }

    // Verify the request exists
    const { data: requestData, error: requestError } = await supabase
      .from('video_requests')
      .select('id, user_id')
      .eq('id', requestId)
      .single();

    if (requestError || !requestData) {
      console.error('Request verification failed:', requestError);
      return Response.json({ error: 'Invalid request ID' }, { status: 404 });
    }

    // Security check: ensure the user ID matches
    if (requestData.user_id !== userId) {
      console.error('User ID mismatch:', {
        requestUserId: requestData.user_id,
        metadataUserId: userId,
      });
      return Response.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Update video request status based on render status
    let updateData: Record<string, any> = {};

    if (webhookData.status === 'succeeded') {
      updateData = {
        render_status: 'done',
        render_url: webhookData.url,
      };
      console.log(
        `Render succeeded for request ${requestId}, URL: ${webhookData.url}`
      );
    } else if (webhookData.status === 'failed') {
      updateData = {
        render_status: 'error',
        render_error: webhookData.error || 'Unknown error',
      };
      console.log(
        `Render failed for request ${requestId}: ${
          webhookData.error || 'Unknown error'
        }`
      );
    } else {
      // For any other status, we log but don't update
      console.log(
        `Received status ${webhookData.status} for request ${requestId}`
      );
      return Response.json({
        message: `Status ${webhookData.status} acknowledged but no update needed`,
      });
    }

    // Update the database
    const { error: updateError } = await supabase
      .from('video_requests')
      .update(updateData)
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating video request:', updateError);
      return Response.json(
        { error: 'Failed to update video request' },
        { status: 500 }
      );
    }

    // Log the activity (optional, non-blocking)
    try {
      await supabase.from('logs').insert({
        user_id: userId,
        action: `render_${webhookData.status}`,
        metadata: {
          requestId,
          renderId: webhookData.id,
          status: webhookData.status,
          scriptId: metadata.scriptId,
          url: webhookData.url,
          duration: webhookData.duration,
          size: webhookData.file_size,
        },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.warn('⚠️ Error logging activity:', logError);
    }

    return Response.json({
      success: true,
      message: 'Status updated successfully',
      requestId,
      status: webhookData.status,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return Response.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
