import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';

export default function SubscriptionScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, markStepCompleted } = useOnboarding();

  useEffect(() => {
    presentPaywall();
  }, []);

  const presentPaywall = async () => {
    try {
      // Dynamic import to avoid errors if package not installed yet
      const { default: RevenueCatUI, PAYWALL_RESULT } = await import(
        'react-native-purchases-ui'
      );

      const paywallResult = await RevenueCatUI.presentPaywall({
        displayCloseButton: true,
      });

      console.log('Paywall result:', paywallResult);

      // Continue regardless of result (user can stay free or upgrade)
      markStepCompleted('subscription');
      nextStep();
    } catch (error) {
      console.error('Paywall error:', error);
      // Continue even if paywall fails
      markStepCompleted('subscription');
      nextStep();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="subscription"
        completedSteps={[
          'welcome',
          'survey',
          'voice-recording',
          'processing',
          'editorial-profile',
          'features',
        ]}
      />

      <View style={styles.content}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des forfaits...</Text>
        <Text style={styles.subText}>
          Découvrez nos offres pour créer plus de vidéos
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
