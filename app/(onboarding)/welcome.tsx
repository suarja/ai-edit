import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, ArrowRight } from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { IMAGES } from '@/lib/constants/images';

export default function WelcomeScreen() {
  const { nextStep, markStepCompleted } = useOnboarding();
  const onboardingSteps = useOnboardingSteps();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleContinue = () => {
    markStepCompleted('welcome');
    nextStep();
  };

  const toggleVideo = () => {
    setVideoPlaying(!videoPlaying);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="welcome"
        completedSteps={[]}
      />

      <View style={styles.header}>
        <Image
          source={{
            uri: IMAGES.welcome.header_studio,
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Bienvenue sur votre</Text>
        <Text style={styles.title}>Studio IA</Text>
        <Text style={styles.subtitle}>
          Créez des vidéos professionnelles avec l&apos;IA
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.videoContainer}>
          {videoPlaying ? (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>Démo vidéo en cours...</Text>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <TouchableOpacity style={styles.playButton} onPress={toggleVideo}>
                <Play size={40} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.videoText}>Découvrez comment ça marche</Text>
            </View>
          )}
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>
            Transformez votre création de contenu
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>
                • Génération rapide de scripts IA
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Clonage vocal naturel</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>
                • Montage vidéo professionnel
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Modèles personnalisables</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Commencer</Text>
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
    height: 220,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  videoContainer: {
    height: 200,
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 122, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoText: {
    color: '#ddd',
    fontSize: 16,
  },
  features: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#ddd',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  processingText: {
    color: '#ddd',
    fontSize: 16,
  },
});
