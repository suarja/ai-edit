-- Ensure the user_roles table exists
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
CREATE POLICY IF NOT EXISTS admin_user_roles_policy ON user_roles USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Allow users to see their own roles
CREATE POLICY IF NOT EXISTS user_roles_select_policy ON user_roles FOR
SELECT USING (auth.uid() = user_id);
-- Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(target_email TEXT) RETURNS TEXT AS $$
DECLARE target_user_id UUID;
BEGIN -- Find the user ID by email
SELECT id INTO target_user_id
FROM auth.users
WHERE email = target_email;
IF target_user_id IS NULL THEN RETURN 'User not found with email: ' || target_email;
END IF;
-- Check if user is already an admin
IF EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = target_user_id
        AND role = 'admin'
) THEN RETURN 'User is already an admin';
END IF;
-- Add admin role to user
INSERT INTO user_roles (user_id, role)
VALUES (target_user_id, 'admin');
RETURN 'User promoted to admin successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;