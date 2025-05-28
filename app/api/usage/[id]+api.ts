import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/utils/api/responses';

/**
 * Usage API controller
 *
 * Fetches the usage statistics for a user
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Authenticate user
    const authHeader = request.headers.get('Authorization');
    const { user, errorResponse: authError } = await AuthService.verifyUser(
      authHeader
    );

    if (authError) {
      return authError;
    }

    // Step 2: Verify requesting user matches requested ID
    if (user.id !== params.id) {
      return errorResponse('Unauthorized access', HttpStatus.FORBIDDEN);
    }

    // Step 3: Fetch usage data
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Failed to fetch usage data:', error);
      return errorResponse(
        'Failed to fetch usage data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Step 4: Calculate usage percentage and format dates
    const usagePercentage = Math.round(
      (data.videos_generated / data.videos_limit) * 100
    );

    const nextResetDate = new Date(data.next_reset_date).toLocaleDateString();
    const lastResetDate = new Date(data.last_reset_date).toLocaleDateString();

    // Step 5: Return formatted usage data
    return successResponse({
      videosGenerated: data.videos_generated,
      videosLimit: data.videos_limit,
      usagePercentage,
      nextResetDate,
      lastResetDate,
      remainingVideos: Math.max(0, data.videos_limit - data.videos_generated),
    });
  } catch (error: any) {
    console.error('❌ Error fetching usage data:', error);
    return errorResponse(
      error.message || 'Failed to fetch usage data',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
