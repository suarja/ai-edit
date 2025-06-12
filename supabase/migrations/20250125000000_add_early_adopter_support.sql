-- Add early adopter support to user_usage table
ALTER TABLE user_usage
ADD COLUMN IF NOT EXISTS is_early_adopter BOOLEAN DEFAULT false;
ALTER TABLE user_usage
ADD COLUMN IF NOT EXISTS early_adopter_expires_at TIMESTAMP WITH TIME ZONE;
-- Update the video limit calculation for the new structure
-- Free users: 3 videos, Pro users: 30 videos
UPDATE user_usage
SET videos_limit = CASE
        WHEN videos_limit >= 999999 THEN 30 -- Pro users get 30 videos (down from unlimited)
        ELSE 3 -- Free users get 3 videos (down from 5)
    END;
-- Add index for early adopter queries
CREATE INDEX IF NOT EXISTS user_usage_early_adopter_idx ON user_usage (is_early_adopter);
-- Function to mark user as early adopter
CREATE OR REPLACE FUNCTION mark_user_as_early_adopter(
        target_user_id UUID,
        expires_in_days INTEGER DEFAULT 90
    ) RETURNS VOID AS $$ BEGIN
UPDATE user_usage
SET is_early_adopter = true,
    early_adopter_expires_at = NOW() + (expires_in_days || ' days')::INTERVAL,
    updated_at = NOW()
WHERE user_id = target_user_id;
IF NOT FOUND THEN RAISE EXCEPTION 'User not found: %',
target_user_id;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to expire early adopters automatically
CREATE OR REPLACE FUNCTION expire_early_adopters() RETURNS INTEGER AS $$
DECLARE expired_count INTEGER;
BEGIN
UPDATE user_usage
SET is_early_adopter = false,
    early_adopter_expires_at = NULL,
    updated_at = NOW()
WHERE is_early_adopter = true
    AND early_adopter_expires_at IS NOT NULL
    AND early_adopter_expires_at < NOW();
GET DIAGNOSTICS expired_count = ROW_COUNT;
RETURN expired_count;
END;
$$ LANGUAGE plpgsql;
-- Add comment for documentation
COMMENT ON COLUMN user_usage.is_early_adopter IS 'Whether the user has early adopter pricing';
COMMENT ON COLUMN user_usage.early_adopter_expires_at IS 'When the early adopter status expires';
COMMENT ON FUNCTION mark_user_as_early_adopter IS 'Mark a user as early adopter with expiration date';
COMMENT ON FUNCTION expire_early_adopters IS 'Expire early adopter status for users past expiration date';