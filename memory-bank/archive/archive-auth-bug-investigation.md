# Archive: Supabase Authentication Bug Investigation

## Task Overview

**Task ID**: STABILITY-002
**Complexity Level**: Level 2
**Priority**: Critical
**Completion Date**: June 1, 2025

## Description

Investigated and diagnosed critical authentication failures in the TestFlight build preventing new user sign-ups. The error "Database error saving new user" (code: unexpected_failure, status: 500) was occurring during account creation despite the app launching successfully.

## Implementation Summary

This investigation followed a systematic approach to identify and diagnose authentication issues in our TestFlight builds. We first resolved environment variable issues and then narrowed down database-level problems that were causing sign-up failures.

### Phase 1: Environment Variable Resolution

1. Fixed critical environment variable handling in TestFlight builds:

   - Enhanced error validation and fallbacks in `lib/config/env.ts`
   - Updated environment variables in `eas.json` for all build profiles
   - Added TypeScript definitions for environment variables
   - Implemented graceful error handling for configuration issues

2. Result: The app successfully launched in TestFlight, but authentication failures persisted during sign-up.

### Phase 2: Auth Debugging Enhancement

1. Enhanced the sign-up screen with detailed error information:

   - Added comprehensive error state UI in sign-up.tsx
   - Implemented detailed error capture including code, message, and status
   - Added debugging toggles for development and TestFlight builds
   - Captured additional context information about the environment

2. Findings: The enhanced debugging confirmed a 500 error with "unexpected_failure" code occurring during user creation, suggesting a database-level issue rather than a client configuration problem.

### Phase 3: Database Investigation

1. Identified potential database issues through migration analysis:

   - Found trigger `handle_new_user` on auth.users table that creates usage records
   - Discovered several migrations modifying auth schema permissions and roles
   - Identified potential recursion issues in database policies

2. Root cause analysis: The error is likely occurring due to one of the following:
   - Failed trigger execution when creating new users
   - Constraint violations in related tables (user_usage, user_roles)
   - Permission issues from modified auth schema

## Technical Challenges

1. **Testing Environment Discrepancies**: The issue only manifested in TestFlight builds, making local reproduction difficult.

2. **Limited Access to Auth Logs**: Without direct access to the Supabase Auth logs from the TestFlight environment, diagnosing specific errors required client-side enhancements.

3. **Complex Database Schema**: The auth schema includes multiple triggers, constraints, and policies that interact during user creation, creating multiple potential failure points.

## Outcomes & Deliverables

1. **Enhanced Error Handling**: Implemented robust client-side error handling with detailed debugging information.

2. **Environment Variable System**: Completely overhauled the environment variable system with proper validation and fallbacks.

3. **Investigation Report**: Created comprehensive documentation of potential causes and solutions.

4. **Debugging UI**: Added developer-friendly debugging UI for authentication issues that can be toggled on in TestFlight builds.

## Lessons Learned

1. **Auth Schema Caution**: Be extremely cautious when modifying the auth schema with triggers or constraints, as they can silently break authentication flows.

2. **Environment Variable Management**: Implement thorough validation and fallbacks for all critical environment variables.

3. **Error Handling Importance**: Comprehensive error handling with detailed information is crucial for diagnosing issues in production environments.

4. **Testing Recommendation**: Test authentication flows thoroughly in production-like environments before releasing to TestFlight.

## Next Steps & Recommendations

1. **Short-term Fixes**:

   - Disable the `handle_new_user` trigger temporarily to confirm it as the root cause
   - Access Supabase Auth logs to identify the specific database error
   - Consider reverting migrations that modified the auth schema

2. **Long-term Improvements**:
   - Implement database migration testing specifically for auth-related changes
   - Create a pre-flight checklist for TestFlight submissions focusing on auth flows
   - Develop a standardized approach to database triggers that includes proper error handling

## References

1. **Related Code**:

   - `app/(auth)/sign-up.tsx`: Enhanced error handling and debugging UI
   - `lib/config/env.ts`: Improved environment variable system
   - `supabase/migrations/20250824143000_add_user_usage_table.sql`: Added trigger on auth.users
   - `supabase/migrations/20250824155100_setup_admin_roles.sql`: User roles setup
   - `supabase/migrations/20250824185000_fix_recursion_in_policies.sql`: Fixed recursion in policies

2. **Documentation**:
   - [Supabase Auth Error Codes](https://supabase.com/docs/guides/auth/debugging/error-codes)
   - [Database error saving new user](https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB)
   - [Resolving 500 Status Authentication Errors](https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8)

## Conclusion

While the investigation didn't result in a complete resolution of the authentication issues, it significantly narrowed down the potential causes and provided a clear path forward. The enhanced error handling and debugging capabilities added during this investigation will be valuable for diagnosing similar issues in the future.
