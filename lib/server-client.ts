import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';

export const supabaseServer = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);
