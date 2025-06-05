import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { SubscriptionCard } from '@/components/onboarding/SubscriptionCard';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';

export default function SubscriptionScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, markStepCompleted } = useOnboarding();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    subscriptionPlans.find((plan) => plan.isRecommended)?.id ||
      subscriptionPlans[0].id
  );

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);

    // Provide haptic feedback
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleContinue = () => {
    // In a real app, you would implement payment processing here
    // For now, we'll just mark the step as completed and continue
    markStepCompleted('subscription');

    // Provide haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available');
    }

    nextStep();
  };

  // French translated subscription plans
  const translatedPlans = subscriptionPlans.map((plan) => ({
    ...plan,
    title:
      plan.title === 'Starter'
        ? 'Débutant'
        : plan.title === 'Creator'
        ? 'Créateur'
        : plan.title === 'Professional'
        ? 'Professionnel'
        : plan.title,
    period:
      plan.period === 'month'
        ? 'mois'
        : plan.period === 'year'
        ? 'an'
        : plan.period,
    features: plan.features.map((feature) => ({
      ...feature,
      text: feature.text.includes('video')
        ? feature.text.replace('videos', 'vidéos')
        : feature.text.includes('templates')
        ? feature.text.replace('templates', 'modèles')
        : feature.text.includes('voice cloning')
        ? feature.text.replace('voice cloning', 'clonage vocal')
        : feature.text.includes('HD export')
        ? feature.text.replace('HD export', 'export HD')
        : feature.text.includes('support')
        ? feature.text.replace('support', 'assistance')
        : feature.text,
    })),
  }));

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
          'trial-offer',
        ]}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Choisissez votre forfait</Text>
        <Text style={styles.subtitle}>
          Sélectionnez le forfait qui correspond le mieux à vos besoins
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {translatedPlans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Votre abonnement sera automatiquement renouvelé. Vous pouvez annuler
            à tout moment dans les paramètres de votre compte.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>S'abonner maintenant</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.termsText}>
          En vous abonnant, vous acceptez nos Conditions d'utilisation et notre
          Politique de confidentialité
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
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
