import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { Mic, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { ProFeatureLock } from '@/components/guards/ProFeatureLock';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';

export default function VoiceCloneOnboardingScreen() {
  const router = useRouter();
  const {
    hasAccess,
    isLoading: isAccessLoading,
    isPro,
    remainingUsage,
  } = useFeatureAccess('voice_clone');
  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  const [isLoading, setIsLoading] = useState(true);
  const [existingClone, setExistingClone] = useState<any | null>(null);

  useEffect(() => {
    const checkExistingClone = async () => {
      setIsLoading(true);
      const user = await fetchUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('voice_clones')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ready')
        .maybeSingle();

      if (data) {
        setExistingClone(data);
      }
      setIsLoading(false);
    };

    checkExistingClone();
  }, []);

  const handleContinueToRecording = () => {
    router.push('/(onboarding)/voice-recording');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/tiktok-analysis');
  };

  if (isAccessLoading || isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasAccess) {
    return (
      <ProFeatureLock
        featureTitle="Clonage Vocal Professionnel"
        featureDescription="Créez une version IA de votre voix pour générer des narrations audio de haute qualité pour toutes vos vidéos."
      />
    );
  }

  if (existingClone) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clonage Vocal</Text>
        </View>
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
            ]}
          >
            <CheckCircle size={64} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Clone Vocal Déjà Actif</Text>
          <Text style={styles.description}>
            Nous avons détecté que vous avez déjà un clone vocal prêt à
            l'emploi. Vous pouvez continuer.
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => router.back()}
          >
            <Text style={styles.startButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clonage Vocal</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mic size={64} color="#007AFF" />
        </View>
        <Text style={styles.title}>Créez votre clone vocal</Text>
        <Text style={styles.description}>
          Enregistrez quelques secondes de votre voix pour permettre à l'IA de
          générer des narrations avec votre propre timbre.
        </Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleContinueToRecording}
        >
          <Text style={styles.startButtonText}>Commencer l'enregistrement</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
