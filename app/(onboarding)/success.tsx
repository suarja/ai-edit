import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import { safeNavigate } from '@/app/_layout';

export default function SuccessScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { markStepCompleted } = useOnboarding();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Provide haptic success feedback when the screen appears
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available');
    }

    // Mark this step as completed
    markStepCompleted('success');
  }, []);

  const handleGetStarted = async () => {
    // Prevent multiple navigation attempts
    if (isNavigating) {
      return;
    }

    try {
      setIsNavigating(true);

      // Use the safe navigation function to navigate to settings
      const success = await safeNavigate(
        router,
        '/settings',
        'replace',
        500
      );

      if (!success) {
        // If navigation failed, show error and reset state
        Alert.alert(
          'Erreur de Navigation',
          "Impossible de naviguer vers l'écran principal. Veuillez réessayer."
        );
        setIsNavigating(false);
      }
    } catch (e) {
      console.error('Error in handleGetStarted:', e);
      setIsNavigating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="success"
        completedSteps={[
          'welcome',
          'survey',
          'voice-recording',
          'processing',
          'editorial-profile',
          'features',
          'trial-offer',
          'subscription',
        ]}
      />

      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        <Text style={styles.title}>Tout est prêt !</Text>
        <Text style={styles.message}>
          Votre compte a été configuré avec succès avec vos préférences et votre
          profil vocal.
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>
            Ce que vous pouvez faire maintenant :
          </Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>
              Créer de nouvelles vidéos IA avec votre voix
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>
              Télécharger du contenu existant pour l'améliorer
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>
              Modifier et personnaliser votre profil éditorial
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>
              Accéder à tous les modèles premium
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.getStartedButton,
            isNavigating && styles.buttonDisabled,
          ]}
          onPress={handleGetStarted}
          disabled={isNavigating}
        >
          <Text style={styles.getStartedText}>
            {isNavigating ? 'Chargement...' : 'Commencer'}
          </Text>
          {!isNavigating && <ArrowRight size={20} color="#fff" />}
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
    justifyContent: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 60,
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
  featuresContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#ddd',
    fontSize: 16,
  },
  footer: {
    padding: 20,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#0055BB',
  },
});
