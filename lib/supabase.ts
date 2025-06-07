import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;

  private constructor() {}

  public static getInstance(): ReturnType<typeof createClient> {
    if (!SupabaseClient.instance) {
      if (typeof window !== 'undefined') {
        const { supabaseBrowserClient } = require('./browser-client');
        SupabaseClient.instance = supabaseBrowserClient;
      } else {
        const { supabaseServer } = require('./server-client');
        SupabaseClient.instance = supabaseServer;
      }
    }

    return SupabaseClient.instance;
  }
}

// Export a single instance
export const supabase = SupabaseClient.getInstance();
