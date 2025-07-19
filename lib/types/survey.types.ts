import { Database } from './supabase-types';

export type ISurvey = Pick<
  Database['public']['Tables']['onboarding_survey']['Row'],
  'user_id' | 'content_goals' | 'pain_points' | 'content_style' | 'platform_focus' | 'content_frequency'
>;