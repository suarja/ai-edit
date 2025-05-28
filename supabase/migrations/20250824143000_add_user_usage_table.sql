-- Create user_usage table for tracking video generation usage
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
-- Create function to automatically create user_usage record when a new user is created
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
-- Create function to automatically reset usage on the reset date
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
-- RLS policies for user_usage table
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
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
-- Create user_roles table if it doesn't exist
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
-- RLS policies for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
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
-- Create an admin user for initial setup (replace with your admin user ID)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-admin-user-id', 'admin');