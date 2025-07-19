import { Database } from './supabase-types';

export type DatabaseUser = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'full_name' | 'avatar_url' | 'role' | 'clerk_user_id'
>;