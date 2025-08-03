import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
} from 'react-native';
import {
  JobType,
  useAccountAnalysis,
} from '@/components/hooks/useAccountAnalysis';
import StartAnalysisScreen from '../analysis/StartAnalysisScreen';
import AnalysisInProgressScreen from '../analysis/AnalysisInProgressScreen';
import { useFeatureAccess } from '@/components/hooks/useFeatureAccess';
import { StandardFeatureLock } from './StandardFeatureLock';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { Lock, BarChart3, TrendingUp, Users } from 'lucide-react-native';
import { usePathname } from 'expo-router';
import { FeatureId } from 'editia-core';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
interface AccountAnalysisGuardProps {
  children: React.ReactNode;
}

const AccountAnalysisGuard: React.FC<AccountAnalysisGuardProps> = ({
  children,
}) => {
  const pathname = usePathname();
  let featureId: FeatureId = 'account_insights';
  if (pathname === '/account-insights') {
    featureId = 'account_insights';
  } else if (pathname === '/account-conversations') {
    featureId = 'account_chat';
  }
  const { hasAccess, isLoading: isAccessLoading } = useFeatureAccess(featureId);
  const {
    analysis,
    activeJob,
    isLoading: isAnalysisLoading,
    error,
    refreshAnalysis,
  } = useAccountAnalysis();
  const { presentPaywall, currentPlan, isReady } = useRevenueCat();
  
  // Enhanced debugging for production issues
  console.log('🔍 AccountAnalysisGuard Debug:', {
    pathname,
    featureId,
    hasAccess,
    isAccessLoading,
    currentPlan,
    isReady,
    environment: __DEV__ ? 'development' : 'production'
  });
  console.log('pathname', pathname);
  const handleAnalysisStart = (job: JobType) => {
    refreshAnalysis(job);
  };

  const handleRetry = () => {
    // To retry, we can simply call refreshAnalysis without arguments.
    // It will clear the current job and re-evaluate,
    // likely showing the StartAnalysisScreen again.
    // A more sophisticated retry would re-trigger the last failed job.
    // For now, let's reset.
    refreshAnalysis();
  };

  useEffect(() => {
    // Optional: handle errors, e.g., show a toast message
    if (error) {
      console.error('AccountAnalysisGuard Error:', error);
    }
  }, [error]);

  if (isAccessLoading || isAnalysisLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🆕 If user doesn't have access, show the lock screen.
  if (!hasAccess) {
    return (
      <StandardFeatureLock
        featureIcon={<Lock color={SHARED_STYLE_COLORS.primary} />}
        featureTitle="Analyse de Compte Approfondie"
        featureDescription="Obtenez une analyse complète de n'importe quel compte TikTok, identifiez les stratégies virales et recevez des recommandations personnalisées."
        features={[
          {
            icon: <BarChart3 color={SHARED_STYLE_COLORS.success} />,
            text: "Analyses détaillées",
          },
          {
            icon: <TrendingUp color={SHARED_STYLE_COLORS.secondary} />,
            text: "Stratégies virales",
          },
          {
            icon: <Users color={SHARED_STYLE_COLORS.warning} />,
            text: "Recommandations personnalisées",
          },
        ]}
        requiredPlan="creator"
      />
    );
  }

  // If there is an active job, show the progress screen
  if (activeJob) {
    return (
      <AnalysisInProgressScreen
        initialJob={activeJob}
        onAnalysisComplete={refreshAnalysis}
        onRetry={handleRetry}
      />
    );
  }

  // If there's no analysis, show the start screen
  if (!analysis) {
    return <StartAnalysisScreen onAnalysisStart={handleAnalysisStart} />;
  }

  // If analysis exists, let user see the content
  return <>{children}</>;
};

export default AccountAnalysisGuard;
