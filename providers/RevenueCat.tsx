import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { CustomerInfo } from 'react-native-purchases';
import React from 'react';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';

// Use keys from your RevenueCat API Keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
};

interface UserUsage {
  videos_generated: number;
  videos_limit: number;
  next_reset_date: string;
  is_early_adopter?: boolean;
}

interface RevenueCatProps {
  isPro: boolean;
  isReady: boolean;
  userUsage: UserUsage | null;
  videosRemaining: number;
  isEarlyAdopter: boolean;
  goPro: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [isEarlyAdopter, setIsEarlyAdopter] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple });
      }
      setIsReady(true);

      // Use more logging during debug if want!
      Purchases.setLogLevel(LOG_LEVEL.ERROR);

      // Listen for customer updates
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInformation(info);
      });

      // Load initial data
      await loadUserUsage();
    };
    init();
  }, []);

  // Update user state based on previous purchases
  const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
    const hasProEntitlement =
      customerInfo?.entitlements.active['pro'] !== undefined;
    setIsPro(hasProEntitlement);

    // Update usage in database if pro status changed
    if (hasProEntitlement) {
      await updateProStatusInDatabase(true);
    }
  };

  // Load user usage from Supabase
  const loadUserUsage = async () => {
    try {
      const user = await fetchUser();
      if (!user) return;

      const { data: usage, error } = await supabase
        .from('user_usage')
        .select(
          'videos_generated, videos_limit, next_reset_date, is_early_adopter'
        )
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to load user usage:', error);
        return;
      }

      setUserUsage(usage);
      setIsEarlyAdopter(usage.is_early_adopter || false);
    } catch (error) {
      console.error('Error loading user usage:', error);
    }
  };

  // Update pro status in database
  const updateProStatusInDatabase = async (isProUser: boolean) => {
    try {
      const user = await fetchUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_usage')
        .update({
          videos_limit: isProUser ? 30 : 3, // Pro gets 30, free gets 3
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update pro status:', error);
      } else {
        // Reload usage after update
        await loadUserUsage();
      }
    } catch (error) {
      console.error('Error updating pro status:', error);
    }
  };

  // Present paywall
  const goPro = async (): Promise<boolean> => {
    try {
      const { RevenueCatUI, PAYWALL_RESULT } = await import(
        'react-native-purchases-ui'
      );

      // Choose offering based on early adopter status
      const offering = isEarlyAdopter ? 'early_adopter' : undefined;

      const paywallResult = await RevenueCatUI.presentPaywall({
        displayCloseButton: true,
        offering: offering,
      });

      switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
          return false;
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Paywall error:', error);
      return false;
    }
  };

  // Refresh usage data
  const refreshUsage = async () => {
    await loadUserUsage();
  };

  // Calculate videos remaining
  const videosRemaining = userUsage
    ? Math.max(0, userUsage.videos_limit - userUsage.videos_generated)
    : 0;

  const value = {
    isPro,
    isReady,
    userUsage,
    videosRemaining,
    isEarlyAdopter,
    goPro,
    refreshUsage,
  };

  // Return empty fragment if provider is not ready (Purchase not yet initialised)
  if (!isReady) return <></>;

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

// Export context for easy usage
export const useRevenueCat = () => {
  return useContext(RevenueCatContext) as RevenueCatProps;
};
