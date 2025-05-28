-- Set the first user as an admin to bootstrap the admin functionality
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