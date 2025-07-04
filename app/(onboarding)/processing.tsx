import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { ProcessingScreen } from '@/components/onboarding/ProcessingScreen';

const processingSteps = [
  'Analyse de vos préférences',
  'Création de votre profil vocal',
  'Personnalisation du style éditorial',
  'Optimisation des modèles de contenu',
];

export default function ProcessingScreenContainer() {
  const { nextStep, markStepCompleted, surveyAnswers } = useOnboarding();
  const onboardingSteps = useOnboardingSteps();

  const handleComplete = () => {
    markStepCompleted('processing');
    // Auto-advance after processing since there's nothing for user to interact with
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="processing"
        completedSteps={['welcome', 'survey', 'voice-recording']}
      />

      <ProcessingScreen
        title="Configuration de votre profil"
        message="Veuillez patienter pendant que nous personnalisons votre expérience selon vos préférences"
        steps={processingSteps}
        onComplete={handleComplete}
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
