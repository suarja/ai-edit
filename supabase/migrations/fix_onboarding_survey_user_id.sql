-- Fix onboarding_survey table if it exists with the wrong user_id type
DO $$ BEGIN -- Check if the table exists
IF EXISTS (
    SELECT
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'onboarding_survey'
) THEN -- Check if user_id column is bigint
IF EXISTS (
    SELECT
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'onboarding_survey'
        AND column_name = 'user_id'
        AND data_type = 'bigint'
) THEN -- Drop foreign key constraints if they exist
IF EXISTS (
    SELECT
    FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'onboarding_survey'
        AND ccu.column_name = 'user_id'
) THEN EXECUTE (
    SELECT 'ALTER TABLE public.onboarding_survey DROP CONSTRAINT ' || tc.constraint_name
    FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'onboarding_survey'
        AND ccu.column_name = 'user_id'
    LIMIT 1
);
END IF;
-- Drop indexes on user_id column if they exist
IF EXISTS (
    SELECT
    FROM pg_indexes
    WHERE tablename = 'onboarding_survey'
        AND indexdef LIKE '%user_id%'
) THEN EXECUTE (
    SELECT 'DROP INDEX ' || indexname
    FROM pg_indexes
    WHERE tablename = 'onboarding_survey'
        AND indexdef LIKE '%user_id%'
    LIMIT 1
);
END IF;
-- Create a temporary column
ALTER TABLE public.onboarding_survey
ADD COLUMN user_id_new UUID;
-- Drop the old column and rename the new one
ALTER TABLE public.onboarding_survey DROP COLUMN user_id;
ALTER TABLE public.onboarding_survey
    RENAME COLUMN user_id_new TO user_id;
-- Add foreign key constraint
ALTER TABLE public.onboarding_survey
ADD CONSTRAINT onboarding_survey_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
-- Add index
CREATE INDEX idx_onboarding_survey_user_id ON public.onboarding_survey(user_id);
RAISE NOTICE 'onboarding_survey table fixed: user_id column changed from bigint to UUID';
ELSE RAISE NOTICE 'onboarding_survey table already has correct user_id type';
END IF;
ELSE RAISE NOTICE 'onboarding_survey table does not exist, no fix needed';
END IF;
END $$;