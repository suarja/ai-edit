import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';
import { CustomPaywall } from '@/components/CustomPaywall';

// Use keys from your RevenueCat API Keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
};

// Check if we're in development mode
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

interface UserUsage {
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

interface RevenueCatProps {
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

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [hasOfferingError, setHasOfferingError] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [plans, setPlans] = useState<Record<string, Plan> | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const maxInitAttempts = 2;

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    const init = async () => {
      try {
        // In development mode on simulator, we might not have proper RevenueCat setup
        if (isDevelopment && Platform.OS === 'ios') {
          console.log(
            '🚧 Development mode detected - using fallback for RevenueCat'
          );
          setHasOfferingError(true);
          setIsReady(true);
          await loadUserUsage();
          return;
        }

        if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: APIKeys.google });
        } else {
          await Purchases.configure({ apiKey: APIKeys.apple });
        }

        // Use more logging during debug if want!
        Purchases.setLogLevel(
          isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR
        );

        // Listen for customer updates
        Purchases.addCustomerInfoUpdateListener(async (info) => {
          await updateCustomerInformation(info);
        });

        // Load initial customer info and usage
        await loadInitialData();

        setIsReady(true);
      } catch (error) {
        console.error('🍎 RevenueCat initialization error:', error);
        console.log(`🔄 Attempt ${initAttempts + 1}/${maxInitAttempts + 1}`);

        // If we've tried enough times, proceed with fallback
        if (initAttempts >= maxInitAttempts) {
          console.log(
            '🚧 Using fallback mode due to RevenueCat initialization failure'
          );
          setHasOfferingError(true);
          setIsReady(true); // Still mark as ready so UI can render with fallbacks
          await loadUserUsage(); // Still load usage from database
        } else {
          // Try again (but not too many times)
          setInitAttempts((prev) => prev + 1);
        }
      }
    };

    const loadSubscriptionPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*');

        if (error) {
          console.error('Failed to fetch subscription plans:', error);
          return;
        }

        const plansData = data.reduce((acc, plan) => {
          acc[plan.id] = plan;
          return acc;
        }, {} as Record<string, Plan>);
        setPlans(plansData);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
      }
    };

    init();
    loadSubscriptionPlans();
  }, [initAttempts]);

  // Load initial customer info and user usage
  const loadInitialData = async () => {
    try {
      // Get current customer info from RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      await updateCustomerInformation(customerInfo);

      // Get offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      } else {
        console.log('No current offerings found.');
        setHasOfferingError(true);
      }

      // Load user usage from database
      await loadUserUsage();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setHasOfferingError(true);
      // Still load usage even if RevenueCat fails
      await loadUserUsage();
    }
  };

  // Update user state based on previous purchases
  const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
    const hasProEntitlement =
      customerInfo?.entitlements.active['Pro'] !== undefined;

    console.log('Customer info updated. Pro status:', hasProEntitlement);
    setIsPro(hasProEntitlement);

    // Sync the user's limit in database with their subscription status
    await syncUserLimitWithSubscription(hasProEntitlement);
  };

  // Load user usage from Supabase
  const loadUserUsage = async () => {
    try {
      const user = await fetchUser();
      if (!user) return;

      const { data: usage, error } = await supabase
        .from('user_usage')
        .select(
          `
          videos_generated, 
          videos_generated_limit, 
          source_videos_used,
          source_videos_limit,
          voice_clones_used,
          voice_clones_limit,
          account_analysis_used,
          account_analysis_limit,
          next_reset_date
        `
        )
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No usage record found, create one
          console.log('No usage record found, creating one...');
          await createUsageRecord(user.id);
          return;
        }
        console.error('Failed to load user usage:', error);
        return;
      }

      setUserUsage(usage);
    } catch (error) {
      console.error('Error loading user usage:', error);
    }
  };

  // Create initial usage record for new users
  const createUsageRecord = async (userId: string) => {
    try {
      // Récupérer les limites du plan gratuit depuis la base de données
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', 'free')
        .single();

      if (planError) {
        console.error('Failed to fetch plan limits:', planError);
        return;
      }

      const { data, error } = await supabase
        .from('user_usage')
        .insert([
          {
            user_id: userId,
            videos_generated: 0,
            videos_generated_limit: planData.videos_generated_limit,
            source_videos_used: 0,
            source_videos_limit: planData.source_videos_limit,
            voice_clones_used: 0,
            voice_clones_limit: planData.voice_clones_limit,
            account_analysis_used: 0,
            account_analysis_limit: planData.account_analysis_limit,
            next_reset_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days from now
          },
        ])
        .select(
          `
          videos_generated, 
          videos_generated_limit, 
          source_videos_used,
          source_videos_limit,
          voice_clones_used,
          voice_clones_limit,
          account_analysis_used,
          account_analysis_limit,
          next_reset_date
        `
        )
        .single();

      if (error) {
        console.error('Failed to create usage record:', error);
        return;
      }

      setUserUsage(data);
    } catch (error) {
      console.error('Error creating usage record:', error);
    }
  };

  // Sync user's limits with their subscription status
  const syncUserLimitWithSubscription = async (isProUser: boolean) => {
    try {
      const user = await fetchUser();
      if (!user) return;

      const planId = isProUser ? 'pro' : 'free';

      // Récupérer les limites du plan depuis la base de données
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) {
        console.error('Failed to fetch plan limits:', planError);
        return;
      }

      // Mettre à jour les limites de l'utilisateur
      const { error } = await supabase
        .from('user_usage')
        .update({
          videos_generated_limit: planData.videos_generated_limit,
          source_videos_limit: planData.source_videos_limit,
          voice_clones_limit: planData.voice_clones_limit,
          account_analysis_limit: planData.account_analysis_limit,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to sync user limits:', error);
      } else {
        console.log(`User limits synced to ${planId} plan`);
        // Reload usage after update
        await loadUserUsage();
      }
    } catch (error) {
      console.error('Error syncing user limits:', error);
    }
  };

  // Present paywall
  const goPro = async (): Promise<boolean> => {
    try {
      // If we have offering errors (common in development), show a fallback alert instead
      if (hasOfferingError) {
        console.log('🚧 Using fallback purchase flow due to offering error');

        if (isDevelopment) {
          // In development mode, simulate Pro access for testing
          console.log('🔧 Development mode: simulating Pro access');
          setIsPro(true);
          await syncUserLimitWithSubscription(true);
          return true;
        }

        // In production with offering errors, show helpful message
        alert(
          'Les forfaits ne sont pas disponibles actuellement. Veuillez réessayer plus tard.'
        );
        return false;
      }

      // Show our custom paywall
      setShowPaywall(true);
      return false; // We'll handle success through the paywall callback
    } catch (error) {
      console.error('Paywall error:', error);
      setHasOfferingError(true);
      return false;
    }
  };

  // Handle paywall purchase completion
  const handlePurchaseComplete = async (success: boolean) => {
    if (success) {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        await updateCustomerInformation(customerInfo);
      } catch (error) {
        console.error('Error refreshing customer info after purchase:', error);
      }
    }
  };

  // Restore purchases
  const restorePurchases = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      await updateCustomerInformation(customerInfo);
      return customerInfo?.entitlements.active['Pro'] !== undefined;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  };

  // Refresh usage data
  const refreshUsage = async () => {
    await loadUserUsage();
  };

  // Calculate current plan
  const currentPlan: 'free' | 'pro' = isPro ? 'pro' : 'free';

  // Calculate dynamic limits based on current plan
  const dynamicVideosLimit = userUsage ? userUsage.videos_generated_limit : 0;

  // Calculate remaining resources
  const videosRemaining = userUsage
    ? Math.max(0, userUsage.videos_generated_limit - userUsage.videos_generated)
    : 0;

  const sourceVideosRemaining = userUsage
    ? Math.max(
        0,
        (userUsage.source_videos_limit || 0) -
          (userUsage.source_videos_used || 0)
      )
    : 0;

  const voiceClonesRemaining = userUsage
    ? Math.max(
        0,
        (userUsage.voice_clones_limit || 0) - (userUsage.voice_clones_used || 0)
      )
    : 0;

  const accountAnalysisRemaining = userUsage
    ? Math.max(
        0,
        (userUsage.account_analysis_limit || 0) -
          (userUsage.account_analysis_used || 0)
      )
    : 0;

  const value = {
    isPro,
    isReady,
    userUsage,
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
    goPro,
    refreshUsage,
    hasOfferingError,
    restorePurchases,
    currentPlan,
    dynamicVideosLimit,
    showPaywall,
    setShowPaywall,
    isDevMode: isDevelopment,
    plans,
    currentOffering,
  };

  // We don't want to block rendering anymore if RevenueCat has issues
  // Just return the provider with the current state
  return (
    <RevenueCatContext.Provider value={value}>
      {children}
      <CustomPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </RevenueCatContext.Provider>
  );
};

// Export context for easy usage
export const useRevenueCat = () => {
  return useContext(RevenueCatContext) as RevenueCatProps;
};
