import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';
import { CustomPaywall } from '@/components/CustomPaywall';
import {
  Plan,
  PlanIdentifier,
  RevenueCatProps,
  UserUsage,
} from '@/lib/types/revenueCat';

// Use keys from your RevenueCat API Keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
};

// Check if we're in development mode
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>('free');
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [hasOfferingError, setHasOfferingError] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [plans, setPlans] = useState<Record<string, Plan> | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const maxInitAttempts = 2;

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    init();
    loadSubscriptionPlans();
  }, [initAttempts]);
  const init = async () => {
    try {
      const user = await fetchUser();
      if (!user) {
        throw new Error('User not found');
      }
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google, appUserID: user.id });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple, appUserID: user.id });
      }

      // Use more logging during debug if want!
      Purchases.setLogLevel(isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

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
  // Load initial customer info and user usage
  const loadInitialData = async () => {
    try {
      // Get current customer info from RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('Customer info:', JSON.stringify(customerInfo, null, 2));
      await updateCustomerInformation(customerInfo);

      // Get offerings
      const offerings = await Purchases.getOfferings();
      console.log('Offerings:', JSON.stringify(offerings, null, 2));
      setOfferings(offerings.all.default);
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
    const hasPro = customerInfo?.entitlements.active['Pro'] !== undefined;
    const hasCreator =
      customerInfo?.entitlements.active['Creator'] !== undefined;

    let plan: PlanIdentifier = 'free';
    if (hasPro) {
      plan = 'pro';
    } else if (hasCreator) {
      plan = 'creator';
    }

    setCurrentPlan(plan);
    console.log('Customer info updated. Current plan:', plan);
    await syncUserLimitWithSubscription(plan);
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
  const syncUserLimitWithSubscription = async (planId: PlanIdentifier) => {
    try {
      const user = await fetchUser();
      if (!user) return;

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
          current_plan_id: planId,
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
  const presentPaywall = async (): Promise<boolean> => {
    try {
      // If we have offering errors (common in development), show a fallback alert instead
      if (hasOfferingError) {
        console.log('🚧 Using fallback purchase flow due to offering error');

        if (isDevelopment) {
          // In development mode, simulate Pro access for testing
          console.log('🔧 Development mode: simulating Pro access');
          await syncUserLimitWithSubscription('pro');
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

  const value: RevenueCatProps = {
    offerings,
    isReady,
    userUsage,
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
    presentPaywall,
    refreshUsage,
    hasOfferingError,
    restorePurchases,
    currentPlan,
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
