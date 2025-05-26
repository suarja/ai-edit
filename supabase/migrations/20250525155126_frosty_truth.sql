/*
  # Initial Schema Setup for Video Generation App

  1. New Tables
    - users: Core user data and authentication
    - editorial_profiles: User's content preferences and style
    - voice_clones: ElevenLabs voice clone data
    - videos: Video asset metadata
    - scripts: Generated and edited video scripts
    - video_requests: Render job tracking
    - payments: Payment history
    - logs: System activity tracking

  2. Security
    - RLS enabled on all tables
    - Policies for user data access
    - Admin-only access for sensitive operations
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Editorial profiles for content style
CREATE TABLE IF NOT EXISTS public.editorial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  persona_description text,
  tone_of_voice text,
  audience text,
  content_examples jsonb,
  style_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Voice clone data
CREATE TABLE IF NOT EXISTS public.voice_clones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  elevenlabs_voice_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'error')),
  sample_files jsonb,
  created_at timestamptz DEFAULT now()
);

-- Video assets
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  tags text[],
  upload_url text,
  duration_seconds float,
  created_at timestamptz DEFAULT now()
);

-- Video scripts
CREATE TABLE IF NOT EXISTS public.scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  raw_prompt text,
  generated_script text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'final')),
  review_notes text,
  created_at timestamptz DEFAULT now()
);

-- Video render requests
CREATE TABLE IF NOT EXISTS public.video_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  script_id uuid REFERENCES public.scripts(id) ON DELETE CASCADE,
  selected_videos uuid[],
  render_status text DEFAULT 'queued' CHECK (render_status IN ('queued', 'rendering', 'done', 'error')),
  render_url text,
  created_at timestamptz DEFAULT now()
);

-- Payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_payment_id text,
  amount_eur integer,
  status text DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed', 'refunded')),
  plan text,
  created_at timestamptz DEFAULT now()
);

-- System logs
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Editorial profiles policies
CREATE POLICY "Users can CRUD own editorial profiles" ON public.editorial_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Voice clones policies
CREATE POLICY "Users can CRUD own voice clones" ON public.voice_clones
  FOR ALL USING (auth.uid() = user_id);

-- Videos policies
CREATE POLICY "Users can CRUD own videos" ON public.videos
  FOR ALL USING (auth.uid() = user_id);

-- Scripts policies
CREATE POLICY "Users can CRUD own scripts" ON public.scripts
  FOR ALL USING (auth.uid() = user_id);

-- Video requests policies
CREATE POLICY "Users can CRUD own video requests" ON public.video_requests
  FOR ALL USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Logs policies
CREATE POLICY "Users can read own logs" ON public.logs
  FOR SELECT USING (auth.uid() = user_id);