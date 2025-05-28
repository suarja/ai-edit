import { supabase } from '@/lib/supabase';
import { errorResponse, HttpStatus } from '@/lib/utils/api/responses';

/**
 * Authentication service for handling user verification
 */
export class AuthService {
  /**
   * Verifies user from an authorization header
   * @param authHeader The Authorization header value
   * @returns Object containing user or error response
   */
  static async verifyUser(authHeader?: string | null) {
    // Check if auth header exists
    if (!authHeader) {
      return {
        user: null,
        errorResponse: errorResponse(
          'Missing authorization header',
          HttpStatus.UNAUTHORIZED
        ),
      };
    }

    // Get token from header
    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Auth error:', error);
      return {
        user: null,
        errorResponse: errorResponse(
          'Invalid authentication token',
          HttpStatus.UNAUTHORIZED
        ),
      };
    }

    if (!data.user) {
      return {
        user: null,
        errorResponse: errorResponse('Unauthorized', HttpStatus.UNAUTHORIZED),
      };
    }

    // Return user data
    return {
      user: data.user,
      errorResponse: null,
    };
  }
}
