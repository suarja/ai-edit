import { AuthService } from '@/lib/services/auth';
import {
  VideoValidationService,
  VideoGeneratorService,
} from '@/lib/services/video';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/utils/api/responses';
import { supabase } from '@/lib/supabase';
import { supabaseServiceRole } from '@/lib/server-client';

/**
 * Video generation API controller
 *
 * Handles POST requests to generate videos using AI
 */
export async function POST(request: Request) {
  console.log('🎬 Starting video generation request...');

  try {
    // Step 1: Authenticate user
    const authHeader = request.headers.get('Authorization');
    const { user, errorResponse: authError } = await AuthService.verifyUser(
      authHeader
    );

    if (authError) {
      return authError;
    }

    // Step 2: Check usage limits
    console.log('📊 Checking usage limits for user:', user.id);

    // Log whether we're using service role or regular client
    console.log(
      `🔑 Using ${
        supabase === supabaseServiceRole ? 'regular' : 'service role'
      } client for database access`
    );

    // Use service role to bypass RLS for usage checking (fallback to regular client if not available)
    const { data: usage, error: usageError } = await supabaseServiceRole
      .from('user_usage')
      .select('videos_generated, videos_limit, next_reset_date')
      .eq('user_id', user.id)
      .single();

    if (usageError) {
      console.error('❌ Failed to check usage limits:', usageError);
      return errorResponse(
        'Failed to check usage limits',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Check if user has reached their limit
    if (usage.videos_generated >= usage.videos_limit) {
      console.warn('⚠️ User has reached their usage limit:', user.id);
      return errorResponse(
        `Monthly video generation limit reached (${usage.videos_generated}/${
          usage.videos_limit
        }). Please wait until ${new Date(
          usage.next_reset_date
        ).toLocaleDateString()} for your limit to reset.`,
        HttpStatus.FORBIDDEN
      );
    }

    // Step 3: Parse and validate request
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return errorResponse(
        'Invalid JSON in request body',
        HttpStatus.BAD_REQUEST
      );
    }

    // Step 4: Validate request body
    const validationResult =
      VideoValidationService.validateRequest(requestBody);
    if (!validationResult.success) {
      return validationResult.error;
    }

    // Step 5: Generate video
    const videoGenerator = new VideoGeneratorService(user);
    const result = await videoGenerator.generateVideo(validationResult.payload);

    console.log('✅ Video generation process completed successfully');

    // Step 6: Update usage counter
    console.log('📝 Updating usage counter for user:', user.id);

    // Update using the same client that was used for fetching
    const { error: updateError } = await supabaseServiceRole
      .from('user_usage')
      .update({
        videos_generated: usage.videos_generated + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('⚠️ Failed to update usage counter:', updateError);
      // Continue with response even if counter update fails
    }

    // Step 7: Return success response
    return successResponse(
      {
        requestId: result.requestId,
        scriptId: result.scriptId,
      },
      HttpStatus.CREATED
    );
  } catch (error: any) {
    // Log error with stack trace for debugging
    console.error('❌ Error in video generation:', error);

    // Determine appropriate status code based on error type
    const statusCode = determineErrorStatusCode(error);

    // Return error response
    return errorResponse(
      error.message || 'Failed to process video request',
      statusCode,
      process.env.NODE_ENV === 'development'
        ? { stack: error.stack }
        : undefined
    );
  }
}

/**
 * Determines the appropriate HTTP status code based on error type
 */
function determineErrorStatusCode(error: any): number {
  // Database errors
  if (
    error.code &&
    (error.code.startsWith('22') || // Data exception
      error.code.startsWith('23') || // Integrity constraint violation
      error.code === 'PGRST') // PostgREST error
  ) {
    return HttpStatus.BAD_REQUEST;
  }

  // Authentication/authorization errors
  if (
    error.message &&
    (error.message.includes('auth') ||
      error.message.includes('token') ||
      error.message.includes('unauthorized') ||
      error.message.includes('permission'))
  ) {
    return HttpStatus.UNAUTHORIZED;
  }

  // Missing resources
  if (
    error.message &&
    (error.message.includes('not found') || error.message.includes('missing'))
  ) {
    return HttpStatus.NOT_FOUND;
  }

  // External API errors (Creatomate)
  if (error.message && error.message.includes('Creatomate')) {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  // Usage limit errors
  if (error.message && error.message.includes('limit reached')) {
    return HttpStatus.FORBIDDEN;
  }

  // Default to internal server error
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
