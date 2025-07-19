import { PurchasesOffering } from 'react-native-purchases';
import { Database } from './supabase-types';

export type UserUsage = Pick<
  Database['public']['Tables']['user_usage']['Row'],
  | 'videos_generated'
  | 'videos_generated_limit'
  | 'source_videos_used'
  | 'source_videos_limit'
  | 'voice_clones_used'
  | 'voice_clones_limit'
  | 'account_analysis_used'
  | 'account_analysis_limit'
>;

export type Plan = Pick<
  Database['public']['Tables']['subscription_plans']['Row'],
  'id' | 'name' | 'description' | 'is_active' | 'videos_generated_limit' | 'source_videos_limit'
  | 'voice_clones_limit'
  | 'account_analysis_limit'
>;



export interface RevenueCatProps {
  isPro: boolean;
  isReady: boolean;
  userUsage: UserUsage | null;
  videosRemaining: number;
  sourceVideosRemaining: number;
  voiceClonesRemaining: number;
  accountAnalysisRemaining: number;
  goPro: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  hasOfferingError: boolean;
  restorePurchases: () => Promise<boolean>;
  currentPlan: 'free' | 'pro';
  dynamicVideosLimit: number; // The actual limit based on subscription status
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  isDevMode: boolean; // Add development mode indicator
  plans: Record<string, Plan> | null;
  currentOffering: PurchasesOffering | null;
}
