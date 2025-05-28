-- Function to make a user an admin by email
CREATE OR REPLACE FUNCTION make_admin_by_email(admin_email TEXT) RETURNS TEXT AS $$
DECLARE target_user_id UUID;
admin_count INT;
BEGIN -- Find the user by email
SELECT id INTO target_user_id
FROM auth.users
WHERE email = admin_email;
-- Check if user exists
IF target_user_id IS NULL THEN RETURN 'Error: No user found with email ' || admin_email;
END IF;
-- Check if user is already an admin
SELECT COUNT(*) INTO admin_count
FROM user_roles
WHERE user_id = target_user_id
    AND role = 'admin';
IF admin_count > 0 THEN RETURN 'User ' || admin_email || ' is already an admin';
END IF;
-- Make user an admin
INSERT INTO user_roles (user_id, role)
VALUES (target_user_id, 'admin');
RETURN 'Success: User ' || admin_email || ' is now an admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Example usage: 
-- SELECT make_admin_by_email('admin@example.com');