import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mic,
  ChevronLeft,
  CheckCircle,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureAccess } from '@/components/hooks/useFeatureAccess';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

export default function VoiceCloneOnboardingScreen() {
  const router = useRouter();
  const { hasAccess, isLoading: isAccessLoading } =
    useFeatureAccess('voice_clone');
  const { fetchUser } = useGetUser();
  const { presentPaywall } = useRevenueCat();

  const [isLoading, setIsLoading] = useState(true);
  const [existingClone, setExistingClone] = useState<any | null>(null);
  const [showLockScreen, setShowLockScreen] = useState(true);

  useEffect(() => {
    const checkExistingClone = async () => {
      setIsLoading(true);
      const user = await fetchUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // const { data, error } = await supabase
      //   .from('voice_clones')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .eq('status', 'ready')
      //   .maybeSingle();

      // if (data) {
      //   setExistingClone(data);
      // }
      setExistingClone(null);
      setIsLoading(false);
    };

    checkExistingClone();
  }, []);

  const handleContinueToRecording = () => {
    router.push('/(onboarding)/voice-recording');
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

  // Si l'utilisateur n'a pas accès, afficher le lock
  if (!hasAccess && showLockScreen) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FeatureLock
          requiredPlan="creator"
          showAsDisabled={false}
          onLockPress={presentPaywall}
        >
          <View style={styles.lockContainer}>
            <Mic size={48} color="#007AFF" />
            <Text style={styles.lockTitle}>Clonage de Voix IA</Text>
            <Text style={styles.lockDescription}>
              Créez votre voix clonée personnalisée pour des vidéos authentiques
              et engageantes.
            </Text>

            <View style={styles.featuresPreview}>
              <View style={styles.featureItem}>
                <Mic size={20} color="#10b981" />
                <Text style={styles.featureText}>
                  Voix clonée en 30 secondes
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Sparkles size={20} color="#3b82f6" />
                <Text style={styles.featureText}>Qualité professionnelle</Text>
              </View>
              <View style={styles.featureItem}>
                <Zap size={20} color="#f59e0b" />
                <Text style={styles.featureText}>Vidéos authentiques</Text>
              </View>
              <View style={styles.featureItem}>
                <Users size={20} color="#8b5cf6" />
                <Text style={styles.featureText}>Engagement amélioré</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={presentPaywall}
            >
              <Text style={styles.upgradeButtonText}>
                Débloquer avec le Plan Créateur
              </Text>
            </TouchableOpacity>
          </View>
        </FeatureLock>
      </SafeAreaView>
    );
  }

  // Si l'utilisateur a déjà un clone vocal
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
        </View>

        <View style={styles.content}>
          <View style={styles.successContainer}>
            <CheckCircle size={64} color="#10b981" />
            <Text style={styles.successTitle}>Voix Clonée Prête !</Text>
            <Text style={styles.successDescription}>
              Votre voix clonée est déjà configurée et prête à être utilisée
              dans vos vidéos.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            // onPress={() => router.pus<h('/(onboarding)/completion')}
          >
            <Text style={styles.continueButtonText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Interface normale pour créer un clone vocal
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mic size={80} color="#007AFF" />
        </View>

        <Text style={styles.title}>Clonage Vocal</Text>
        <Text style={styles.description}>
          Créez votre voix clonée personnalisée pour des vidéos authentiques et
          engageantes.
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.featureText}>Voix personnalisée</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.featureText}>Vidéos authentiques</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.featureText}>Qualité professionnelle</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueToRecording}
        >
          <Text style={styles.continueButtonText}>
            Commencer l&apos;enregistrement
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresPreview: {
    gap: 12,
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
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
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresList: {
    gap: 16,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});
