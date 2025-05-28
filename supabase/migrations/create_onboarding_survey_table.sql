-- Create onboarding_survey table with proper UUID type for user_id
CREATE TABLE IF NOT EXISTS onboarding_survey (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content_goals TEXT,
    pain_points TEXT,
    content_style TEXT,
    platform_focus TEXT,
    content_frequency TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create RLS policies
ALTER TABLE onboarding_survey ENABLE ROW LEVEL SECURITY;
-- Allow users to read only their own survey data
CREATE POLICY "Users can read their own survey data" ON onboarding_survey FOR
SELECT USING (auth.uid() = user_id);
-- Allow users to insert/update only their own survey data
CREATE POLICY "Users can insert their own survey data" ON onboarding_survey FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own survey data" ON onboarding_survey FOR
UPDATE USING (auth.uid() = user_id);
-- Give service role full access
CREATE POLICY "Service role has full access to survey data" ON onboarding_survey USING (auth.role() = 'service_role');
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_survey_user_id ON onboarding_survey(user_id);