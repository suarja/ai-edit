import { PurchasesOffering } from 'react-native-purchases';
import { 
  UserUsage, 
  PlanIdentifier, 
  SubscriptionPlan,
  UserUsageService,
  UserUsageServiceConfig,
  UsageField
} from 'editia-core';

// Re-export types from editia-core for convenience
export type { 
  UserUsage, 
  PlanIdentifier, 
  SubscriptionPlan,
  UserUsageService,
  UserUsageServiceConfig,
  UsageField 
};

// The Plan type is now the same as SubscriptionPlan from editia-core
export type Plan = SubscriptionPlan;

// Usage increment result
export interface UsageIncrementResult {
  success: boolean;
  newUsage?: UserUsage;
  error?: string;
}

// Plan update result
export interface PlanUpdateResult {
  success: boolean;
  updatedUsage?: UserUsage;
  previousPlan?: PlanIdentifier;
  newPlan?: PlanIdentifier;
  error?: string;
}

export interface RevenueCatProps {
  isReady: boolean;
  userUsage: UserUsage | null;
  currentPlan: PlanIdentifier;
  offerings: any; // Tous les offerings RevenueCat
  
  // Les compteurs restants sont toujours utiles
  videosRemaining: number;
  sourceVideosRemaining: number;
  voiceClonesRemaining: number;
  accountAnalysisRemaining: number;
  scriptConversationsRemaining: number;
  
  // Core RevenueCat methods
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  
  // Usage management methods (powered by UserUsageService)
  incrementUsage: (field: UsageField, amount?: number) => Promise<boolean>;
  checkUsageLimit: (field: UsageField) => Promise<boolean>;
  resetMonthlyUsage: () => Promise<boolean>;
  
  // Garder les états de l'UI
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  
  // Infos contextuelles
  hasOfferingError: boolean;
  isDevMode: boolean;
  plans: Record<string, Plan> | null;
  currentOffering: PurchasesOffering | null;
}