-- This migration fixes the infinite recursion in RLS policies
-- by creating a separate admin check function that doesn't cause recursion
-- Step 1: Create a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$ BEGIN -- Direct SQL query with no RLS involved
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_roles.user_id = is_admin.user_id
            AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS admin_user_roles_policy ON user_roles;
DROP POLICY IF EXISTS admin_user_usage_policy ON user_usage;
-- Step 3: Create new non-recursive policies
-- Policy for user_roles table - allow admins to manage roles
CREATE POLICY admin_user_roles_policy ON user_roles USING (
    is_admin(auth.uid())
    OR user_id = auth.uid()
);
-- Policy for user_usage table - allow admins to see and modify all usage data
CREATE POLICY admin_user_usage_policy ON user_usage USING (
    is_admin(auth.uid())
    OR user_id = auth.uid()
);
-- Step 4: We don't need the bootstrap admin policy anymore since we have is_admin()
DROP POLICY IF EXISTS bootstrap_admin_policy ON user_roles;
-- Create a new policy for inserting into user_roles that ensures only admins can add admins
-- except for the initial admin setup
CREATE POLICY insert_user_roles_policy ON user_roles FOR
INSERT WITH CHECK (
        -- Allow users to insert their own non-admin roles
        (
            user_id = auth.uid()
            AND role <> 'admin'
        )
        OR -- Allow admins to insert any roles
        is_admin(auth.uid())
        OR -- Allow initial admin creation if no admins exist
        (
            role = 'admin'
            AND NOT EXISTS (
                SELECT 1
                FROM user_roles
                WHERE role = 'admin'
            )
        )
    );
-- Set up grants to allow the function to be executed
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;