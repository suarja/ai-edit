import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';

// For server-side operations that need to bypass RLS
export const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY); // Fallback to anon key if service role key is not available

// Development-only warning for missing service role key
if (__DEV__ && !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Some admin operations may fail due to RLS restrictions.'
  );
  console.warn(
    'Add SUPABASE_SERVICE_ROLE_KEY to your .env file for full functionality.'
  );
}

// For regular server operations with RLS
export const supabaseServer = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);
