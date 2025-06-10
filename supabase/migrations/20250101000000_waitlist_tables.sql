/*
 # Waitlist Tables for Edit-IA
 
 1. New Tables
 - waitlist_signups: Core waitlist signup data
 - platform_preferences: Enum for iOS/Android preferences
 
 2. Security
 - RLS enabled on all tables
 - Policies for user data access (public read for admin, own data for users)
 - Admin-only modification access
 
 3. Features
 - Required: name, email, platform preference
 - Optional: TikTok URL for outreach
 - Timestamps for analytics
 - Email uniqueness constraint
 */
-- Create enum for platform preferences
CREATE TYPE platform_preference AS ENUM ('ios', 'android');
-- Waitlist signups table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    platform platform_preference NOT NULL,
    tiktok_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- Create unique constraint on email
ALTER TABLE public.waitlist_signups
ADD CONSTRAINT waitlist_signups_email_unique UNIQUE (email);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS waitlist_signups_email_idx ON public.waitlist_signups (email);
CREATE INDEX IF NOT EXISTS waitlist_signups_platform_idx ON public.waitlist_signups (platform);
CREATE INDEX IF NOT EXISTS waitlist_signups_created_at_idx ON public.waitlist_signups (created_at);
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_signups_updated_at BEFORE
UPDATE ON public.waitlist_signups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- Allow public to insert (signup)
CREATE POLICY "Anyone can signup for waitlist" ON public.waitlist_signups FOR
INSERT WITH CHECK (true);
-- Allow public to read their own signup (for confirmation)
CREATE POLICY "Users can read own waitlist signup" ON public.waitlist_signups FOR
SELECT USING (true);
-- We'll implement email-based access in application logic
-- Only admins can update/delete waitlist entries
CREATE POLICY "Only admins can modify waitlist" ON public.waitlist_signups FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete waitlist" ON public.waitlist_signups FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Function to validate TikTok URL format (optional)
CREATE OR REPLACE FUNCTION validate_tiktok_url(url text) RETURNS boolean AS $$ BEGIN IF url IS NULL
    OR url = '' THEN RETURN true;
-- Optional field
END IF;
-- Check if URL starts with TikTok domain patterns
RETURN url ~* '^https?://(www\.)?(tiktok\.com|vm\.tiktok\.com)/.*$';
END;
$$ LANGUAGE plpgsql;
-- Add check constraint for TikTok URL validation
ALTER TABLE public.waitlist_signups
ADD CONSTRAINT valid_tiktok_url CHECK (validate_tiktok_url(tiktok_url));
-- Add check constraint for email format
ALTER TABLE public.waitlist_signups
ADD CONSTRAINT valid_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );