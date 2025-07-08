import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env, logEnvironmentStatus } from '@/lib/config/env';

// Log environment status in development
if (__DEV__) {
  logEnvironmentStatus();
}

let supabaseClient: ReturnType<typeof createClient>;

try {
  // Initialize the Supabase client
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // Verify the client was initialized correctly
  if (!supabaseClient) {
    throw new Error('Failed to initialize Supabase client');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  reportError(
    error instanceof Error
      ? error
      : new Error('Unknown error initializing Supabase')
  );

  // Create a fallback client that fails gracefully
  supabaseClient = {
    auth: {
      getSession: async () => {
        console.error('Using fallback Supabase client - auth not available');
        throw new Error(
          'Supabase client not properly initialized due to missing configuration'
        );
      },
      signOut: async () => {
        console.error('Using fallback Supabase client - auth not available');
        throw new Error(
          'Supabase client not properly initialized due to missing configuration'
        );
      },
      // Add other required auth methods
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            console.error(
              'Using fallback Supabase client - database not available'
            );
            throw new Error(
              'Supabase client not properly initialized due to missing configuration'
            );
          },
        }),
      }),
    }),
    // Add other required methods
  } as any;
}

export const supabaseBrowserClient = supabaseClient;
