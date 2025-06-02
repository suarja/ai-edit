# Reflection: Supabase Authentication Bug Investigation

## Issue Overview

During our TestFlight deployment, we encountered a critical authentication bug that prevented new users from signing up. This issue manifested as a "Database error saving new user" with code "unexpected_failure" and HTTP status 500. While fixing the initial environment variable issues allowed the app to launch successfully, user registration remained broken.

## Technical Analysis

### Root Cause Investigation

Our investigation revealed multiple potential causes for this issue:

1. **Database Triggers**: The `handle_new_user` trigger on the `auth.users` table may be failing. This trigger automatically creates a `user_usage` record for each new user, but could fail if:

   - The trigger function encounters an error
   - The target table (`user_usage`) has constraints that aren't being met
   - The transaction is rolled back due to concurrency issues

2. **Auth Schema Modifications**: Several migrations have modified the auth schema:

   - Added a trigger on `auth.users` table (20250824143000_add_user_usage_table.sql)
   - Created user roles and permissions (20250824155100_setup_admin_roles.sql)
   - Modified policies to fix recursion issues (20250824185000_fix_recursion_in_policies.sql)

3. **Permission Issues**: The migration scripts include security definer functions and custom roles that might have altered the permissions required for new user creation.

### Environment Context

The issue only appears in the TestFlight build, suggesting that:

- The production environment might have different database configurations
- The trigger might rely on database conditions that differ in production vs. development
- Authentication in real devices might have additional constraints compared to simulators

## Resolution Approach

Based on our investigation, we've identified several potential solutions:

1. **Review Auth Logs**: Access the Supabase dashboard's Auth Logs to find detailed error messages that would help pinpoint the exact cause.

2. **Examine Database Triggers**: Analyze the `handle_new_user` trigger function to ensure it handles edge cases properly and has appropriate error handling.

3. **Temporarily Disable Trigger**: Consider temporarily disabling the trigger to test if this resolves the issue, which would confirm our hypothesis.

4. **Restore Default Schema**: If necessary, restore the auth schema to its default configuration to eliminate any custom constraints or triggers that might be causing issues.

## Lessons & Improvements

This investigation has highlighted several opportunities for improvement:

### Development Process Improvements

1. **Test Auth Flows Early**: We should test authentication flows earlier in the development cycle, especially in production-like environments.

2. **Database Migration Reviews**: Implement stricter reviews for migrations that affect critical system schemas like auth.

3. **Staged Deployments**: Consider a staged deployment approach where new features are gradually introduced to production.

### Technical Improvements

1. **Enhanced Error Handling**: The enhanced error debugging in the sign-up screen proved invaluable during our investigation. We should extend this pattern to other critical flows.

2. **Database Triggers Best Practices**: Establish guidelines for database triggers, especially those that interact with system schemas:

   - Implement proper error handling in trigger functions
   - Use transaction management appropriately
   - Document the purpose and behavior of each trigger

3. **Environment Consistency**: Ensure greater consistency between development, testing, and production environments to catch these issues earlier.

## Documentation Improvements

1. **Migration Documentation**: Create detailed documentation for each migration, particularly those affecting system schemas.

2. **Troubleshooting Guide**: Develop a troubleshooting guide for common authentication issues.

3. **Testing Checklist**: Create a testing checklist specifically for authentication flows across different environments.

## Conclusion

While this bug has delayed our TestFlight testing, it has provided valuable insights into improving our development process. By implementing the lessons learned, we can build more robust authentication systems and deployment processes in the future.

The investigation has also deepened our understanding of Supabase's authentication system and the complexities of managing database triggers and permissions, which will benefit future development efforts.
