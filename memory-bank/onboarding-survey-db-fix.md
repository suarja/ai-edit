# Onboarding Survey Database Fix

## Issue Description

~~We're encountering~~ We were encountering a database type mismatch error when saving survey data during the onboarding process:

```
ERROR: Error saving survey data: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type bigint: \"e70fe38c-501c-4752-9ae7-47e30b5ff56d\""}
```

This error occurred because:

1. The `user_id` column in the `onboarding_survey` table was defined as a `bigint` type
2. We were trying to save a UUID string (which is the correct type for Supabase auth user IDs)
3. PostgreSQL cannot implicitly convert the UUID to a bigint

## ✅ Status: RESOLVED

The database schema has been fixed. The `user_id` column in the `onboarding_survey` table is now properly defined as a `UUID` type that matches the Supabase auth.users table.

## Solution Implemented

The database schema was updated by changing the `user_id` column type from `bigint` to `UUID` to match the Supabase auth.users table. This allows us to directly save user IDs from the authentication system without type conversion issues.

### Code Updates

The temporary workarounds have been removed from:

- `app/(onboarding)/voice-recording.tsx` - Now using direct Supabase client calls

### Previous Workarounds (No Longer Needed)

During the period when the database schema was incorrect, we had implemented these workarounds:

1. In `app/(onboarding)/voice-recording.tsx`:

   - Used REST API instead of Supabase client to bypass type checking
   - Converted UUID to string in requests
   - Bypassed database saving entirely and used in-memory logging

2. In `supabase/functions/process-onboarding/index.ts`:
   - Added fallback using RPC to a custom function
   - Enhanced error handling to prevent flow disruption

## How to Apply the Fix

Since we're encountering issues with Supabase CLI migration commands, we'll need to apply the database fix directly using the Supabase dashboard or psql:

### Option 1: Using Supabase Dashboard SQL Editor

1. Login to the Supabase dashboard
2. Go to the SQL Editor section
3. Create a new query and paste the contents of:
   - `supabase/migrations/fix_onboarding_survey_user_id.sql`
   - `supabase/migrations/create_save_onboarding_survey_function.sql`
4. Execute the queries

### Option 2: Using psql (if you have direct database access)

1. Connect to your Supabase database using psql:

   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
   ```

2. Copy and paste the contents of each migration file:

   ```sql
   -- First run the table fix script
   -- Contents of fix_onboarding_survey_user_id.sql

   -- Then run the function creation script
   -- Contents of create_save_onboarding_survey_function.sql
   ```

### Option 3: Using Supabase CLI (if properly configured)

If you can set up the Supabase CLI correctly:

1. Apply the database migrations:

   ```bash
   npx supabase login
   npx supabase link --project-ref [YOUR-PROJECT-ID]
   npx supabase migration up
   ```

## Verification Steps

To verify that the database fix has been applied correctly:

1. Check the column type in the database:

   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'onboarding_survey'
     AND column_name = 'user_id';
   ```

   The result should show `user_id` with data_type `uuid`.

2. Test saving data with the updated code:

   - Complete the onboarding flow and check for any errors in the console
   - Verify the data was saved correctly in the database

3. If needed, recover any previously lost data from the logs and manually insert it into the database.

## Future Prevention

1. Always define foreign key columns with the same type as their reference tables
2. For Supabase auth user references, always use UUID type
3. Consider using TypeScript types generated from the database schema to catch these issues earlier

## Data Recovery

If any survey data was lost due to this issue, you can check the logs to recover it. The temporary fixes should prevent further data loss while the permanent fix is being applied.
