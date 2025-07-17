import { useClerkAuth } from '@/components/hooks/useClerkAuth';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';

export type DatabaseUser = {
  id: string; // Database UUID
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  clerk_user_id: string;
};

export const useGetUser = () => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const { client: supabase } = useClerkSupabaseClient();

  const fetchUser = async (): Promise<DatabaseUser | null> => {
    if (!clerkUser?.id) {
      return null;
    }
    console.log('🧐 Looking up database user for Clerk ID:', clerkUser.id);

    try {
      // Use clerk_user_id ONLY ONCE to find the database user
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role, clerk_user_id')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (error) {
        console.error('❌ Error fetching database user:', error);
        console.error('❌ Clerk User ID causing error:', clerkUser.id);
        return null;
      }

      console.log('✅ Database user retrieved:', {
        databaseId: data.id,
        clerkId: data.clerk_user_id,
        email: data.email,
      });

      // Return the database user with the database ID as the primary identifier
      return data;
    } catch (err) {
      console.error('❌ Unexpected error in fetchUser:', err);
      return null;
    }
  };

  return { clerkUser, clerkLoaded, isSignedIn, fetchUser };
};
