-- Backfill usage records for existing users
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