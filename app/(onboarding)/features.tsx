import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Upload, Mic, User, Video, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function FeaturesScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, markStepCompleted } = useOnboarding();

  const handleContinue = () => {
    markStepCompleted('features');

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
        steps={onboardingSteps}
        currentStep="features"
        completedSteps={[
          'welcome',
          'survey',
          'voice-recording',
          'processing',
          'editorial-profile',
        ]}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Fonctionnalités clés</Text>
        <Text style={styles.subtitle}>Votre studio de création tout-en-un</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featureItem}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
            ]}
          >
            <Upload size={32} color="#007AFF" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Vidéos sources illimitées</Text>
            <Text style={styles.featureDescription}>
              Uploadez autant de vidéos que vous voulez pour créer votre
              bibliothèque de contenu personnel.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
            ]}
          >
            <Video size={32} color="#ef4444" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>
              Génération IA de vidéos courtes
            </Text>
            <Text style={styles.featureDescription}>
              Créez des vidéos courtes engageantes avec l&apos;IA en décrivant
              simplement ce que vous voulez.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
            ]}
          >
            <Mic size={32} color="#4CAF50" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Clonage vocal IA</Text>
            <Text style={styles.featureDescription}>
              Utilisez votre propre voix dans vos vidéos grâce à notre
              technologie de clonage vocal 11Labs.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
            ]}
          >
            <User size={32} color="#FFC107" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>
              Profil éditorial personnalisé
            </Text>
            <Text style={styles.featureDescription}>
              L&apos;IA apprend votre style de création pour générer du contenu
              qui vous ressemble vraiment.
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>
            La nouvelle façon de créer du contenu
          </Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>30</Text>
              <Text style={styles.statLabel}>Vidéos/mois Pro</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>€5</Text>
              <Text style={styles.statLabel}>Early Adopter</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>€10</Text>
              <Text style={styles.statLabel}>Prix régulier</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continuer</Text>
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
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
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
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
