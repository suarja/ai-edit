-- 1. Extend user_usage table
ALTER TABLE public.user_usage
ADD COLUMN IF NOT EXISTS source_videos_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS source_videos_limit INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS voice_clones_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS voice_clones_limit INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_analysis_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_analysis_limit INTEGER NOT NULL DEFAULT 0;
-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    videos_limit INTEGER NOT NULL,
    source_videos_limit INTEGER NOT NULL,
    voice_clones_limit INTEGER NOT NULL,
    account_analysis_limit INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 3. Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    required_plan TEXT REFERENCES public.subscription_plans(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 4. Seed initial data
-- Upsert to avoid errors on re-running
INSERT INTO public.subscription_plans (
        id,
        name,
        description,
        videos_limit,
        source_videos_limit,
        voice_clones_limit,
        account_analysis_limit
    )
VALUES (
        'free',
        'Gratuit',
        'Plan gratuit avec fonctionnalités limitées',
        3,
        10,
        0,
        0
    ),
    (
        'pro',
        'Pro',
        'Plan professionnel avec toutes les fonctionnalités',
        30,
        999999,
        1,
        4
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.feature_flags (id, name, description, required_plan)
VALUES (
        'voice_clone',
        'Clonage Vocal',
        'Créer un clone de votre voix pour la narration',
        'pro'
    ),
    (
        'account_analysis',
        'Analyse de Compte',
        'Analyse approfondie de votre compte TikTok',
        'pro'
    ) ON CONFLICT (id) DO NOTHING;
-- 5. Create monthly usage reset function and trigger
CREATE OR REPLACE FUNCTION public.handle_monthly_reset() RETURNS TRIGGER AS $$ BEGIN -- Check if the next reset date is in the past
    IF OLD.next_reset_date <= now() THEN -- Reset monthly counters
    NEW.videos_generated := 0;
-- source_videos are a hard limit, not reset monthly
-- voice_clones are a one-time use, not reset monthly
NEW.account_analysis_used := 0;
-- Update the reset dates
NEW.last_reset_date := now();
NEW.next_reset_date := now() + interval '1 month';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop existing trigger if it exists, to be safe
DROP TRIGGER IF EXISTS trigger_check_monthly_reset ON public.user_usage;
-- Create the trigger to run before each update
CREATE TRIGGER trigger_check_monthly_reset BEFORE
UPDATE ON public.user_usage FOR EACH ROW EXECUTE FUNCTION public.handle_monthly_reset();