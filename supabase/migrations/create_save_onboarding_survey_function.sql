-- Create a function to save onboarding survey data
CREATE OR REPLACE FUNCTION save_onboarding_survey(
        p_user_id TEXT,
        -- Accept as text to avoid type issues
        p_content_goals TEXT,
        p_pain_points TEXT,
        p_content_style TEXT,
        p_platform_focus TEXT,
        p_content_frequency TEXT
    ) RETURNS BOOLEAN AS $$
DECLARE v_user_id UUID;
v_exists BOOLEAN;
BEGIN -- Try to convert the string to UUID
BEGIN v_user_id := p_user_id::UUID;
EXCEPTION
WHEN OTHERS THEN RAISE EXCEPTION 'Invalid UUID format: %',
p_user_id;
RETURN FALSE;
END;
-- Check if the user exists in auth.users
SELECT EXISTS(
        SELECT 1
        FROM auth.users
        WHERE id = v_user_id
    ) INTO v_exists;
IF NOT v_exists THEN RAISE EXCEPTION 'User with ID % does not exist',
v_user_id;
RETURN FALSE;
END IF;
-- Check if a record already exists
SELECT EXISTS(
        SELECT 1
        FROM onboarding_survey
        WHERE user_id = v_user_id
    ) INTO v_exists;
IF v_exists THEN -- Update existing record
UPDATE onboarding_survey
SET content_goals = p_content_goals,
    pain_points = p_pain_points,
    content_style = p_content_style,
    platform_focus = p_platform_focus,
    content_frequency = p_content_frequency,
    updated_at = NOW()
WHERE user_id = v_user_id;
ELSE -- Insert new record
INSERT INTO onboarding_survey (
        user_id,
        content_goals,
        pain_points,
        content_style,
        platform_focus,
        content_frequency
    )
VALUES (
        v_user_id,
        p_content_goals,
        p_pain_points,
        p_content_style,
        p_platform_focus,
        p_content_frequency
    );
END IF;
RETURN TRUE;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Error in save_onboarding_survey: %',
SQLERRM;
RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;