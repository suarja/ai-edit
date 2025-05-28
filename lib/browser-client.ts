import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// For debugging purposes
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

export const supabaseBrowserClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
