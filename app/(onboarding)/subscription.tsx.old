import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useRevenueCat } from '@/providers/RevenueCat';
import { Crown, Zap, ArrowRight } from 'lucide-react-native';

export default function SubscriptionScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, markStepCompleted } = useOnboarding();
  const {
    isPro,
    videosRemaining,
    userUsage,
    isEarlyAdopter,
    goPro,
    isReady,
    hasOfferingError,
  } = useRevenueCat();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // If user is already Pro, skip this step
  useEffect(() => {
    if (isPro && isReady) {
      markStepCompleted('subscription');
      nextStep();
    }
  }, [isPro, isReady]);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);

      // If we have offering errors, show a custom alert instead of RevenueCat UI
      if (hasOfferingError) {
        Alert.alert(
          'Service temporairement indisponible',
          'Notre service de paiement est actuellement en maintenance. Vous pouvez continuer avec le plan gratuit et mettre à niveau plus tard.',
          [
            { text: 'Continuer gratuitement', onPress: handleContinue },
            { text: 'Réessayer', onPress: () => setIsUpgrading(false) },
          ]
        );
        return;
      }

      const success = await goPro();

      if (success) {
        // User upgraded successfully
        markStepCompleted('subscription');
        nextStep();
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Vous pouvez continuer avec le plan gratuit.',
        [{ text: 'Continuer', onPress: handleContinue }]
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleContinue = () => {
    markStepCompleted('subscription');
    nextStep();
  };

  // Show loading while RevenueCat initializes
  if (!isReady) {
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
          <Text style={styles.loadingText}>Initialisation...</Text>
          <Text style={styles.subText}>
            Préparation de vos options d&apos;abonnement
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get appropriate price to display
  const priceToShow = isEarlyAdopter ? '€5' : '€10';

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
        <View style={styles.header}>
          <Crown size={48} color="#FFD700" />
          <Text style={styles.title}>Passez Pro</Text>
          <Text style={styles.subtitle}>
            Débloquez tout le potentiel de votre créativité
          </Text>
        </View>

        <View style={styles.planContainer}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Plan Pro</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{priceToShow}</Text>
              <Text style={styles.priceUnit}>/mois</Text>
              {isEarlyAdopter && (
                <View style={styles.earlyAdopterBadge}>
                  <Text style={styles.earlyAdopterBadgeText}>-50%</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>30 vidéos IA par mois</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>
                Upload illimité de vidéos sources
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Clonage vocal avancé</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>
                Profil éditorial personnalisé
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Support prioritaire</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.upgradeButton,
              isEarlyAdopter && styles.earlyAdopterButton,
              isUpgrading && styles.disabledButton,
            ]}
            onPress={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Zap size={20} color="#fff" />
                <Text style={styles.upgradeButtonText}>
                  {isEarlyAdopter
                    ? `Démarrer (${priceToShow})`
                    : `Démarrer (${priceToShow})`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.freeOption}>
          Ou continuez avec le plan gratuit (3 vidéos/mois)
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continuer gratuitement</Text>
          <ArrowRight size={20} color="#888" />
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  planContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
  },
  earlyAdopterBadge: {
    position: 'absolute',
    top: -12,
    right: -16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  earlyAdopterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
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
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  earlyAdopterButton: {
    backgroundColor: '#FF6B35',
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  freeOption: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  continueText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
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
