-- Fix RLS policies for Clerk authentication
-- The issue: auth.uid() returns Clerk user ID, but user_id fields contain database UUIDs
-- Solution: Add clerk_user_id field and create helper function to get database user ID
-- Step 1: Add clerk_user_id field to users table if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
        AND column_name = 'clerk_user_id'
) THEN
ALTER TABLE public.users
ADD COLUMN clerk_user_id text UNIQUE;
CREATE INDEX IF NOT EXISTS users_clerk_user_id_idx ON public.users (clerk_user_id);
END IF;
END $$;
-- Step 2: Create helper function to get database user ID from Clerk user ID
CREATE OR REPLACE FUNCTION get_database_user_id() RETURNS UUID AS $$
DECLARE db_user_id UUID;
BEGIN -- Look up database user ID using the Clerk user ID from auth.uid()
SELECT id INTO db_user_id
FROM public.users
WHERE clerk_user_id = auth.uid();
RETURN db_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_database_user_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_user_id TO anon;
-- Step 3: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can CRUD own editorial profiles" ON public.editorial_profiles;
DROP POLICY IF EXISTS "Users can CRUD own voice clones" ON public.voice_clones;
DROP POLICY IF EXISTS "Users can CRUD own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can CRUD own scripts" ON public.scripts;
DROP POLICY IF EXISTS "Users can CRUD own video requests" ON public.video_requests;
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can read own logs" ON public.logs;
-- Step 4: Create new Clerk-compatible policies
-- Users policies - can access own data using database user ID
CREATE POLICY "Users can read own data" ON public.users FOR
SELECT USING (id = get_database_user_id());
CREATE POLICY "Users can update own data" ON public.users FOR
UPDATE USING (id = get_database_user_id());
-- Editorial profiles policies
CREATE POLICY "Users can CRUD own editorial profiles" ON public.editorial_profiles FOR ALL USING (user_id = get_database_user_id());
-- Voice clones policies
CREATE POLICY "Users can CRUD own voice clones" ON public.voice_clones FOR ALL USING (user_id = get_database_user_id());
-- Videos policies
CREATE POLICY "Users can CRUD own videos" ON public.videos FOR ALL USING (user_id = get_database_user_id());
-- Scripts policies
CREATE POLICY "Users can CRUD own scripts" ON public.scripts FOR ALL USING (user_id = get_database_user_id());
-- Video requests policies - this is the main one causing the UUID error
CREATE POLICY "Users can CRUD own video requests" ON public.video_requests FOR ALL USING (user_id = get_database_user_id());
-- Payments policies
CREATE POLICY "Users can read own payments" ON public.payments FOR
SELECT USING (user_id = get_database_user_id());
-- Logs policies
CREATE POLICY "Users can read own logs" ON public.logs FOR
SELECT USING (user_id = get_database_user_id());
-- Step 5: Update the admin function to use the new helper function
DROP FUNCTION IF EXISTS is_admin(uuid);
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE db_user_id UUID;
BEGIN -- Get database user ID from Clerk user ID
db_user_id := get_database_user_id();
IF db_user_id IS NULL THEN RETURN FALSE;
END IF;
-- Check if user is admin using database user ID
RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = db_user_id
        AND role = 'admin'
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Update user_roles policies to use the new admin function
DROP POLICY IF EXISTS admin_user_roles_policy ON user_roles;
DROP POLICY IF EXISTS admin_user_usage_policy ON user_usage;
DROP POLICY IF EXISTS user_roles_select_policy ON user_roles;
DROP POLICY IF EXISTS insert_user_roles_policy ON user_roles;
-- Create new user_roles policies
CREATE POLICY admin_user_roles_policy ON user_roles USING (
    is_admin()
    OR user_id = get_database_user_id()
);
CREATE POLICY user_roles_select_policy ON user_roles FOR
SELECT USING (user_id = get_database_user_id());
CREATE POLICY insert_user_roles_policy ON user_roles FOR
INSERT WITH CHECK (
        -- Allow users to insert their own non-admin roles
        (
            user_id = get_database_user_id()
            AND role <> 'admin'
        )
        OR -- Allow admins to insert any roles
        is_admin()
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
-- If user_usage table exists, update its policy too
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user_usage'
) THEN DROP POLICY IF EXISTS admin_user_usage_policy ON user_usage;
CREATE POLICY admin_user_usage_policy ON user_usage USING (
    is_admin()
    OR user_id = get_database_user_id()
);
END IF;
END $$;