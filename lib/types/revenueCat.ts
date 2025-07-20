import { PurchasesOffering } from 'react-native-purchases';
import { 
  UserUsage, 
  PlanIdentifier, 
  SubscriptionPlan 
} from 'editia-core';

// Re-export types from editia-core for convenience
export type { UserUsage, PlanIdentifier, SubscriptionPlan };

// The Plan type is now the same as SubscriptionPlan from editia-core
export type Plan = SubscriptionPlan;

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
  
  // Renommer goPro pour plus de clarté
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  
  // Garder les états de l'UI
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  
  // Infos contextuelles
  hasOfferingError: boolean;
  isDevMode: boolean;
  plans: Record<string, Plan> | null;
  currentOffering: PurchasesOffering | null;
}