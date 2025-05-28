-- Step 1: Create user_roles table first
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);
-- Add indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles (role);
-- Step 2: Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    videos_generated INTEGER NOT NULL DEFAULT 0,
    videos_limit INTEGER NOT NULL DEFAULT 5,
    last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    next_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Create unique index on user_id to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS user_usage_user_id_idx ON user_usage (user_id);
-- Step 3: Create function to reset usage
CREATE OR REPLACE FUNCTION reset_user_usage() RETURNS TRIGGER AS $$ BEGIN -- If the current date is past the next_reset_date, reset the usage
    IF now() >= NEW.next_reset_date THEN NEW.videos_generated := 0;
NEW.last_reset_date := now();
NEW.next_reset_date := now() + INTERVAL '30 days';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to automatically reset usage on update
DROP TRIGGER IF EXISTS on_user_usage_update ON user_usage;
CREATE TRIGGER on_user_usage_update BEFORE
UPDATE ON user_usage FOR EACH ROW EXECUTE FUNCTION reset_user_usage();
-- Step 4: Create function to create usage records for new users
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO user_usage (user_id)
VALUES (NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Step 5: Add RLS policies for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- First drop any existing policies to avoid errors
DROP POLICY IF EXISTS bootstrap_admin_policy ON user_roles;
DROP POLICY IF EXISTS admin_user_roles_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_select_policy ON user_roles;
-- Bootstrap policy for the first admin (no admins exist yet)
CREATE POLICY bootstrap_admin_policy ON user_roles FOR
INSERT WITH CHECK (true);
-- Only allow admins to manage roles
CREATE POLICY admin_user_roles_policy ON user_roles USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Allow users to see their own roles
CREATE POLICY user_roles_select_policy ON user_roles FOR
SELECT USING (auth.uid() = user_id);
-- Step 6: Add RLS policies for user_usage table
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
-- First drop any existing policies to avoid errors
DROP POLICY IF EXISTS user_usage_select_policy ON user_usage;
DROP POLICY IF EXISTS user_usage_update_policy ON user_usage;
DROP POLICY IF EXISTS admin_user_usage_policy ON user_usage;
-- Policy to allow users to see only their own usage data
CREATE POLICY user_usage_select_policy ON user_usage FOR
SELECT USING (auth.uid() = user_id);
-- Policy to allow users to update only their own usage data
CREATE POLICY user_usage_update_policy ON user_usage FOR
UPDATE USING (auth.uid() = user_id);
-- Policy to allow admins to see and modify all usage data
CREATE POLICY admin_user_usage_policy ON user_usage USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Step 7: Make the first user an admin
DO $$
DECLARE first_user_id UUID;
BEGIN -- Get the first user in the system (by creation date)
SELECT id INTO first_user_id
FROM auth.users
ORDER BY created_at ASC
LIMIT 1;
-- If there's at least one user, make them an admin
IF first_user_id IS NOT NULL THEN -- Check if they're already an admin
IF NOT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = first_user_id
        AND role = 'admin'
) THEN -- Make them an admin
INSERT INTO user_roles (user_id, role)
VALUES (first_user_id, 'admin');
END IF;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Step 8: Backfill usage records for existing users
DO $$
DECLARE user_id UUID;
BEGIN -- Loop through all users who don't have usage records yet
FOR user_id IN
SELECT auth.users.id
FROM auth.users
    LEFT JOIN user_usage ON auth.users.id = user_usage.user_id
WHERE user_usage.id IS NULL LOOP -- Insert a new usage record for each user
INSERT INTO user_usage (
        user_id,
        videos_generated,
        videos_limit,
        last_reset_date,
        next_reset_date,
        created_at,
        updated_at
    )
VALUES (
        user_id,
        0,
        5,
        now(),
        now() + INTERVAL '30 days',
        now(),
        now()
    );
END LOOP;
END;
$$ LANGUAGE plpgsql;