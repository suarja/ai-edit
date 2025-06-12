import { createClient } from '@supabase/supabase-js';
import { useSession, useUser } from '@clerk/clerk-expo';
import { useMemo } from 'react';
import { env } from './config/env';

/**
 * Custom hook that creates a Supabase client with Clerk session token injection
 * Based on official Clerk documentation for Supabase integration
 */
export function useClerkSupabaseClient() {
  const { user } = useUser();
  const { session } = useSession();

  const client = useMemo(() => {
    return createClient(
      env.EXPO_PUBLIC_SUPABASE_URL,
      env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          // Inject Clerk session token into all Supabase requests
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken();
            
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`);
            }

            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );
  }, [session]);

  return {
    client,
    user,
    isLoaded: !!user,
  };
}

/**
 * Alternative approach: Function to create Clerk-authenticated Supabase client
 * Use this if you need a client outside of React components
 */
export function createClerkSupabaseClient(session: any) {
  return createClient(
    env.EXPO_PUBLIC_SUPABASE_URL,
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken();
          
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
} 