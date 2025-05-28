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

    console.log('🔐 User authenticated:', user.id);

    // Step 2: Parse and validate request
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

    // Step 3: Validate request body
    const validationResult =
      VideoValidationService.validateRequest(requestBody);
    if (!validationResult.success) {
      return validationResult.error;
    }

    // Step 4: Generate video
    const videoGenerator = new VideoGeneratorService(user);
    const result = await videoGenerator.generateVideo(validationResult.payload);

    console.log('✅ Video generation process completed successfully');

    // Step 5: Return success response
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

  // Default to internal server error
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
