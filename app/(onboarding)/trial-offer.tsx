import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Bell, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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

export default function TrialOfferScreen() {
  const { nextStep, markStepCompleted } = useOnboarding();

  const handleContinue = () => {
    markStepCompleted('trial-offer');

    // Provide haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }

    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={ONBOARDING_STEPS}
        currentStep="trial-offer"
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
        <View style={styles.bellContainer}>
          <Bell size={60} color="#007AFF" />
        </View>

        <Text style={styles.title}>Rappel d'essai gratuit</Text>
        <Text style={styles.message}>
          Nous vous enverrons une notification avant la fin de votre essai
          gratuit pour que vous puissiez décider si vous souhaitez continuer.
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Que se passe-t-il ensuite ?</Text>
          <Text style={styles.infoText}>
            Vous aurez 7 jours pour essayer toutes les fonctionnalités premium.
            Nous ne vous facturerons rien, sauf si vous choisissez de continuer
            après la fin de l'essai.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>
            Pendant votre essai, vous obtenez :
          </Text>

          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>
              Génération vidéo IA illimitée
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>
              Accès complet à tous les modèles
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>
              Fonctionnalités de clonage vocal personnalisé
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Traitement prioritaire</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continuer vers les forfaits</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
  },
  bellContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  benefitText: {
    color: '#ddd',
    fontSize: 16,
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
