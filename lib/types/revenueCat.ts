import { PurchasesOffering } from "react-native-purchases";

export interface UserUsage {
  videos_generated: number;
  videos_generated_limit: number;
  source_videos_used: number;
  source_videos_limit: number;
  voice_clones_used: number;
  voice_clones_limit: number;
  account_analysis_used: number;
  account_analysis_limit: number;
  next_reset_date: string;
}

export interface Plan {
  id: string;
  name: string;
  features: string[];
  videos_generated_limit: number;
  source_videos_limit: number;
  voice_clones_limit: number;
  account_analysis_limit: number;
}

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
