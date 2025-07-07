import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mic, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { ProFeatureLock } from '@/components/guards/ProFeatureLock';

export default function OnboardingVoiceCloneScreen() {
  const { hasAccess, isLoading, isPro, remainingUsage } =
    useFeatureAccess('voice_clone');

  const handleContinueToRecording = () => {
    router.push('/(onboarding)/voice-recording');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/tiktok-analysis');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ProFeatureLock
          featureTitle="Clonage Vocal"
          featureDescription="Le clonage vocal est une fonctionnalité exclusive pour les abonnés Pro. Passez au niveau supérieur pour créer une voix IA unique."
          onSkip={handleSkip}
        />
      </SafeAreaView>
    );
  }

  // Si l'utilisateur est Pro mais a déjà utilisé son clone vocal
  if (isPro && remainingUsage <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.proLockContainer}>
          <Mic size={48} color="#007AFF" />
          <Text style={styles.proLockTitle}>Clone Vocal Déjà Créé</Text>
          <Text style={styles.proLockDescription}>
            Vous avez déjà utilisé votre crédit de clonage vocal. Vous pouvez
            maintenant continuer vers la prochaine étape.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/(onboarding)/tiktok-analysis')}
          >
            <Text style={styles.upgradeButtonText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/3756878/pexels-photo-3756878.jpeg',
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Clone Your Voice</Text>
        <Text style={styles.subtitle}>
          Create a unique AI voice that sounds just like you
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Mic size={32} color="#007AFF" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Personalized Voice</Text>
              <Text style={styles.benefitDescription}>
                Your AI-generated videos will use your own voice, making your
                content more authentic and engaging
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Quick and Easy</Text>
            <Text style={styles.infoText}>
              Just record or upload a few short audio samples, and we&apos;ll
              create a perfect clone of your voice
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinueToRecording}
          >
            <Text style={styles.buttonText}>Create Voice Clone</Text>
            <ArrowRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proLockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#111',
  },
  proLockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  proLockDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  benefits: {
    gap: 24,
  },
  benefit: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
  },
  benefitContent: {
    flex: 1,
    gap: 8,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
