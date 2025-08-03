import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  JobType,
  useAccountAnalysis,
} from '@/components/hooks/useAccountAnalysis';
import StartAnalysisScreen from '../analysis/StartAnalysisScreen';
import AnalysisInProgressScreen from '../analysis/AnalysisInProgressScreen';
import { useFeatureAccess } from '@/components/hooks/useFeatureAccess';
import { FeatureLock } from './FeatureLock';
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
      <FeatureLock requiredPlan="creator" onLockPress={presentPaywall}>
        <View style={styles.lockContainer}>
          <Lock size={48} color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.lockTitle}>Analyse de Compte Approfondie</Text>
          <Text style={styles.lockDescription}>
            Obtenez une analyse complète de n&apos;importe quel compte TikTok,
            identifiez les stratégies virales et recevez des recommandations
            personnalisées.
          </Text>

          <View style={styles.featuresPreview}>
            <View style={styles.featureItem}>
              <BarChart3 size={20} color={SHARED_STYLE_COLORS.success} />
              <Text style={styles.featureText}>Analyses détaillées</Text>
            </View>
            <View style={styles.featureItem}>
              <TrendingUp size={20} color={SHARED_STYLE_COLORS.secondary} />
              <Text style={styles.featureText}>Stratégies virales</Text>
            </View>
            <View style={styles.featureItem}>
              <Users size={20} color={SHARED_STYLE_COLORS.warning} />
              <Text style={styles.featureText}>
                Recommandations personnalisées
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={presentPaywall}
          >
            <Text style={styles.upgradeButtonText}>
              Débloquer avec le Plan Créateur
            </Text>
          </TouchableOpacity>
        </View>
      </FeatureLock>
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

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60, // Add space for the X button
    gap: 20,
    backgroundColor: 'transparent', // Let FeatureLock handle the background
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresPreview: {
    gap: 12,
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountAnalysisGuard;
