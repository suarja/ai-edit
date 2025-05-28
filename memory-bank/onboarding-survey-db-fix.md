# Onboarding Survey Database Fix

## Issue Description

We're encountering a database type mismatch error when saving survey data during the onboarding process:

```
ERROR: Error saving survey data: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type bigint: \"e70fe38c-501c-4752-9ae7-47e30b5ff56d\""}
```

This error occurs because:

1. The `user_id` column in the `onboarding_survey` table is defined as a `bigint` type
2. We're trying to save a UUID string (which is the correct type for Supabase auth user IDs)
3. PostgreSQL cannot implicitly convert the UUID to a bigint

## Solution

We need to fix the database schema by changing the `user_id` column type from `bigint` to `UUID` to match the Supabase auth.users table.

### Temporary Code Fixes (Already Implemented)

We've implemented temporary workarounds in the code:

1. In `app/(onboarding)/voice-recording.tsx`:

   - Using the REST API instead of the Supabase client to bypass type checking
   - Converting the UUID to a string in the request
   - Allowing the flow to continue even if saving fails

2. In `supabase/functions/process-onboarding/index.ts`:
   - Added a fallback mechanism using RPC to a custom function
   - Added more robust error handling

### Permanent Database Fix (To Be Applied)

We've created migration files to fix the database structure:

1. `supabase/migrations/create_onboarding_survey_table.sql`:

   - Creates the table with the correct UUID type if it doesn't exist

2. `supabase/migrations/fix_onboarding_survey_user_id.sql`:

   - Modifies the existing table if it already exists with the wrong type
   - Changes the column type from `bigint` to `UUID`

3. `supabase/migrations/create_save_onboarding_survey_function.sql`:
   - Creates a database function that safely handles user_id type conversion
   - Implements proper error handling

## How to Apply the Fix

Follow these steps to apply the database fix:

1. Apply the database migrations:

   ```bash
   npx supabase migration up
   ```

2. Verify the table structure:

   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'onboarding_survey';
   ```

3. Test the function:

   ```sql
   SELECT save_onboarding_survey(
     '00000000-0000-0000-0000-000000000000', -- Test UUID
     'test_goals',
     'test_pains',
     'test_style',
     'test_platform',
     'test_frequency'
   );
   ```

4. After verifying the fix, remove the temporary workarounds from:
   - `app/(onboarding)/voice-recording.tsx`
   - `supabase/functions/process-onboarding/index.ts`

## Future Prevention

1. Always define foreign key columns with the same type as their reference tables
2. For Supabase auth user references, always use UUID type
3. Consider using TypeScript types generated from the database schema to catch these issues earlier

## Data Recovery

If any survey data was lost due to this issue, you can check the logs to recover it. The temporary fixes should prevent further data loss while the permanent fix is being applied.
