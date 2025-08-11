import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';
import { Paywall } from '@/components/Paywall';
import { RevenueCatProps } from '@/lib/types/revenueCat';
import { PlanIdentifier, UserUsage, SubscriptionPlan, UserUsageService, UsageField } from 'editia-core';
import { revenueCatLogger } from '@/lib/services/revenueCatLoggingService';
import { useUser } from '@clerk/clerk-expo';

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
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>('free');
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [hasOfferingError, setHasOfferingError] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan> | null>(
    null
  );
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [allOfferings, setAllOfferings] = useState<any>(null);
  const maxInitAttempts = 5; // Augmenté de 2 à 5

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  
  // Initialize UserUsageService
  const userUsageService = useMemo(() => {
    if (supabase) {
      return UserUsageService.getInstance(supabase);
    }
    return null;
  }, [supabase]);

  useEffect(() => {
    // Attendre que Clerk soit chargé avant d'initialiser
    if (clerkLoaded && clerkUser) {
      revenueCatLogger.setSupabaseClient(supabase);
      initWithSupabaseUserId();
      loadSubscriptionPlans();
    } else if (clerkLoaded && !clerkUser) {
      // Utilisateur pas connecté, initialiser l'UI sans RevenueCat
      setIsReady(true);
      loadSubscriptionPlans();
    }
  }, [initAttempts, clerkLoaded, clerkUser]);

  const initWithSupabaseUserId = async () => {
    try {
      // Récupérer l'UUID Supabase de l'utilisateur
      const user = await fetchUser();
      if (user) {
        revenueCatLogger.setUserId(user.id);
        init();
      } else {
        init(); // Continuer sans user ID pour les logs
      }
    } catch {
      init(); // Continuer sans user ID pour les logs
    }
  };
  const init = async () => {
    const timer = revenueCatLogger.createTimer();
    const isFirstLaunch = initAttempts === 0;
    
    try {
      await revenueCatLogger.logInitStart(isFirstLaunch);
      
      // Timeout pour fetchUser (10s)
      const user = await Promise.race([
        fetchUser(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('fetchUser timeout')), 10000)
        )
      ]);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Timeout pour Purchases.configure (15s)
      const configPromise = Platform.OS === 'android' 
        ? Purchases.configure({
            apiKey: APIKeys.google,
            appUserID: user.id,
          })
        : Purchases.configure({ apiKey: APIKeys.apple });
        
      await Promise.race([
        configPromise,
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Purchases.configure timeout')), 15000)
        )
      ]);

      // Use more logging during debug if want!
      Purchases.setLogLevel(isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

      // Listen for customer updates
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        await updateCustomerInformation(info);
      });

      // Load initial customer info and usage avec retry
      await loadInitialDataWithRetry();

      setIsRevenueCatReady(true);
      setIsReady(true);
      const duration = timer.stop();
      await revenueCatLogger.logInitSuccess(duration);
      
    } catch (error) {
      const duration = timer.stop();
      console.error('🍎 RevenueCat initialization error:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        await revenueCatLogger.logInitTimeout(duration, initAttempts + 1);
      } else {
        await revenueCatLogger.logInitFailed(error as Error, duration, initAttempts + 1);
      }

      // If we've tried enough times, proceed with fallback
      if (initAttempts >= maxInitAttempts) {
        setHasOfferingError(true);
        setIsReady(true); // Still mark as ready so UI can render with fallbacks
        await loadUserUsage(); // Still load usage from database
        await revenueCatLogger.logColdStartIssue(`Max init attempts reached (${maxInitAttempts})`);
      } else {
        // Retry with exponential backoff
        const delay = Math.pow(2, initAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
        setTimeout(() => {
          setInitAttempts((prev) => prev + 1);
        }, delay);
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
        acc[plan.id as PlanIdentifier] = plan as SubscriptionPlan;
        return acc;
      }, {} as Record<string, SubscriptionPlan>);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };
  // Load initial customer info and user usage avec retry
  const loadInitialDataWithRetry = async () => {
    // Charger les données en parallèle avec timeouts individuels
    const results = await Promise.allSettled([
      loadCustomerInfoWithTimeout(),
      loadOfferingsWithTimeout(),
      loadUserUsage()
    ]);
    
    // Analyser les résultats
    const [customerResult, offeringsResult, usageResult] = results;
    
    if (customerResult.status === 'rejected') {
      console.error('Customer info failed:', customerResult.reason);
    }
    
    if (offeringsResult.status === 'rejected') {
      console.error('Offerings failed:', offeringsResult.reason);
      setHasOfferingError(true);
    }
    
    if (usageResult.status === 'rejected') {
      console.error('Usage loading failed:', usageResult.reason);
    }
  };
  
  const loadCustomerInfoWithTimeout = async () => {
    const timer = revenueCatLogger.createTimer();
    try {
      await revenueCatLogger.logCustomerInfoLoadStart();
      
      const customerInfo = await Promise.race([
        Purchases.getCustomerInfo(),
        new Promise<CustomerInfo>((_, reject) => 
          setTimeout(() => reject(new Error('getCustomerInfo timeout')), 10000)
        )
      ]);
      
      await updateCustomerInformation(customerInfo);
      await revenueCatLogger.logCustomerInfoLoadSuccess(customerInfo, timer.stop());
      return customerInfo;
    } catch (error) {
      const duration = timer.stop();
      if (error instanceof Error && error.message.includes('timeout')) {
        await revenueCatLogger.logCustomerInfoLoadTimeout(duration);
      } else {
        await revenueCatLogger.logCustomerInfoLoadFailed(error as Error, duration);
      }
      throw error;
    }
  };
  
  const loadOfferingsWithTimeout = async () => {
    const timer = revenueCatLogger.createTimer();
    try {
      await revenueCatLogger.logOfferingsLoadStart();
      
      const offerings = await Promise.race([
        Purchases.getOfferings(),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('getOfferings timeout')), 10000)
        )
      ]);
      
      setAllOfferings(offerings);
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      } else {
        console.log('No current offerings found.');
        setHasOfferingError(true);
      }
      
      await revenueCatLogger.logOfferingsLoadSuccess(offerings, timer.stop());
      return offerings;
    } catch (error) {
      const duration = timer.stop();
      if (error instanceof Error && error.message.includes('timeout')) {
        await revenueCatLogger.logOfferingsLoadTimeout(duration);
      } else {
        await revenueCatLogger.logOfferingsLoadFailed(error as Error, duration);
      }
      throw error;
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

  // Load user usage from Supabase using UserUsageService
  const loadUserUsage = async () => {
    if (!userUsageService) {
      console.error('UserUsageService not initialized');
      return;
    }
    
    try {
      const user = await Promise.race([
        fetchUser(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('fetchUser timeout in loadUserUsage')), 5000)
        )
      ]);
      
      if (!user) {
        await revenueCatLogger.logUserFetchFailed(new Error('User not found in loadUserUsage'));
        return;
      }

      const usage = await userUsageService.getUserUsage(user.id);
      
      if (usage) {
        setUserUsage(usage);
      } else {
        console.log('No usage record found or could not be created');
      }
    } catch (error) {
      console.error('Error loading user usage:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        await revenueCatLogger.logUserFetchFailed(error as Error);
      }
    }
  };


  // Sync user's limits with their subscription status using UserUsageService
  const syncUserLimitWithSubscription = async (planId: PlanIdentifier) => {
    if (!userUsageService) {
      console.error('UserUsageService not initialized');
      return;
    }
    
    const timer = revenueCatLogger.createTimer();
    
    try {
      const user = await fetchUser();
      if (!user) {
        await revenueCatLogger.logUserFetchFailed(new Error('User not found in syncUserLimitWithSubscription'));
        return;
      }

      await revenueCatLogger.logSyncUserLimitsStarted(planId, user.id);

      // Use UserUsageService to update the plan
      const updatedUsage = await userUsageService.updateUserPlan(user.id, planId);
      
      if (updatedUsage) {
        console.log('✅ User limits synced to', planId, 'plan. Updated data:', updatedUsage);
        await revenueCatLogger.logSyncUserLimitsSuccess(planId, user.id, timer.stop());
        setUserUsage(updatedUsage);
      } else {
        console.error('❌ Failed to sync user limits');
        await revenueCatLogger.logSyncUserLimitsFailed(
          new Error('UserUsageService.updateUserPlan returned null'),
          planId,
          user.id,
          timer.stop()
        );
      }
    } catch (error) {
      console.error('❌ Error syncing user limits:', error);
      await revenueCatLogger.logSyncUserLimitsFailed(error as Error, planId, 'unknown', timer.stop());
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
        console.log('🎉 Purchase marked as successful, fetching updated customer info...');
        
        // Get updated customer info (purchase via purchasePackage should have already updated it)
        const customerInfo = await Purchases.getCustomerInfo();
        
        console.log('📱 Post-purchase customer info:', {
          entitlements: Object.keys(customerInfo.entitlements.active),
          hasProEntitlement: customerInfo.entitlements.active['Pro'] !== undefined,
          hasCreatorEntitlement: customerInfo.entitlements.active['Creator'] !== undefined,
          detectedPlan: customerInfo.entitlements.active['Pro'] ? 'pro' : 
                        customerInfo.entitlements.active['Creator'] ? 'creator' : 'free',
          activeSubscriptions: customerInfo.activeSubscriptions
        });
        
        await updateCustomerInformation(customerInfo);
      } catch (error) {
        console.error('❌ Error getting customer info after purchase:', error);
      }
    } else {
      console.log('⚠️ Purchase not successful, no sync needed');
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

  // Increment usage for a specific field using UserUsageService
  const incrementUsage = async (field: UsageField, amount: number = 1): Promise<boolean> => {
    if (!userUsageService) {
      console.error('UserUsageService not initialized');
      return false;
    }
    
    try {
      const user = await fetchUser();
      if (!user) {
        console.error('User not found for usage increment');
        return false;
      }

      const success = await userUsageService.incrementUsage(user.id, field, amount);
      
      if (success) {
        // Refresh usage data to reflect the change
        await loadUserUsage();
      }
      
      return success;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  // Check if user has reached usage limit for a specific field
  const checkUsageLimit = async (field: UsageField): Promise<boolean> => {
    if (!userUsageService) {
      console.error('UserUsageService not initialized');
      return true; // Assume limit reached if service unavailable
    }
    
    try {
      const user = await fetchUser();
      if (!user) {
        console.error('User not found for usage limit check');
        return true; // Assume limit reached if user unavailable
      }

      return await userUsageService.checkUsageLimit(user.id, field);
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return true; // Assume limit reached on error
    }
  };

  // Reset monthly usage counters
  const resetMonthlyUsage = async (): Promise<boolean> => {
    if (!userUsageService) {
      console.error('UserUsageService not initialized');
      return false;
    }
    
    try {
      const user = await fetchUser();
      if (!user) {
        console.error('User not found for usage reset');
        return false;
      }

      const success = await userUsageService.resetMonthlyUsage(user.id);
      
      if (success) {
        // Refresh usage data to reflect the reset
        await loadUserUsage();
      }
      
      return success;
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      return false;
    }
  };
  // Utility functions (local to avoid React Native compatibility issues)
  const calculateRemainingUsage = (used: number, limit: number): number => {
    return Math.max(0, limit - used);
  };

  // Calculate remaining resources
  const videosRemaining = useMemo(() => {
    if (!userUsage) return 0;
    return Math.max(
      0,
      userUsage.videos_generated_limit - userUsage.videos_generated
    );
  }, [userUsage]);

  const sourceVideosRemaining = useMemo(() => {
    console.log(' 🤣User usage', !!userUsage);
    if (!userUsage) return 0;
    return calculateRemainingUsage(
      userUsage.source_videos_used,
      userUsage.source_videos_limit
    );
  }, [userUsage]);

  const voiceClonesRemaining = useMemo(() => {
    if (!userUsage) return 0;
    return calculateRemainingUsage(
      userUsage.voice_clones_used,
      userUsage.voice_clones_limit
    );
  }, [userUsage]);

  const accountAnalysisRemaining = useMemo(() => {
    if (!userUsage) return 0;
    return calculateRemainingUsage(
      userUsage.account_analysis_used,
      userUsage.account_analysis_limit
    );
  }, [userUsage]);

  const scriptConversationsRemaining = useMemo(() => {
    if (!userUsage) return 0;
    return calculateRemainingUsage(
      userUsage.script_conversations_used,
      userUsage.script_conversations_limit
    );
  }, [userUsage]);

  const value: RevenueCatProps = {
    offerings: allOfferings,
    isReady,
    userUsage,
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
    scriptConversationsRemaining,
    presentPaywall,
    refreshUsage,
    incrementUsage,
    checkUsageLimit,
    resetMonthlyUsage,
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
      <Paywall
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
