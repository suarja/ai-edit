import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ProcessingScreen } from '@/components/onboarding/ProcessingScreen';

const ONBOARDING_STEPS = [
  'welcome',
  'survey',
  'voice-recording',
  'processing',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

const processingSteps = [
  'Analyse de vos préférences',
  'Création de votre profil vocal',
  'Personnalisation du style éditorial',
  'Optimisation des modèles de contenu',
];

export default function ProcessingScreenContainer() {
  const { nextStep, markStepCompleted, surveyAnswers, isAutoProgressAllowed } =
    useOnboarding();

  const handleComplete = () => {
    markStepCompleted('processing');
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={ONBOARDING_STEPS}
        currentStep="processing"
        completedSteps={['welcome', 'survey', 'voice-recording']}
      />

      <ProcessingScreen
        title="Configuration de votre profil"
        message="Veuillez patienter pendant que nous personnalisons votre expérience selon vos préférences"
        steps={processingSteps}
        onComplete={handleComplete}
        autoComplete={isAutoProgressAllowed('processing')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
