import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, UserSearch, ArrowRight } from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';

export default function FeaturesScreen() {
  const router = useRouter();
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, markStepCompleted } = useOnboarding();

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  const handleFinishOnboarding = () => {
    markStepCompleted('features');
    nextStep(); // This will navigate to 'success' screen
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="features"
        completedSteps={['welcome', 'survey']}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Configurez vos Super-Pouvoirs</Text>
        <Text style={styles.subtitle}>
          Lancez-vous avec nos fonctionnalités Pro pour un impact maximum.
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleNavigate('/(onboarding)/voice-clone')}
        >
          <View style={styles.iconContainer}>
            <Mic size={32} color="#4CAF50" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Configurer mon Clone Vocal</Text>
            <Text style={styles.featureDescription}>
              Créez une version IA de votre voix pour des narrations parfaites.
              (Recommandé)
            </Text>
          </View>
          <ArrowRight size={24} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleNavigate('/(onboarding)/tiktok-analysis')}
        >
          <View style={styles.iconContainer}>
            <UserSearch size={32} color="#007AFF" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>
              Lancer une Analyse de Compte
            </Text>
            <Text style={styles.featureDescription}>
              Analysez un compte TikTok pour découvrir des stratégies de contenu
              virales.
            </Text>
          </View>
          <ArrowRight size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishOnboarding}
        >
          <Text style={styles.finishButtonText}>Terminer</Text>
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
  header: {
    padding: 20,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconContainer: {
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  finishButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
