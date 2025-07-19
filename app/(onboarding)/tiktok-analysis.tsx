import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CheckCircle,
  ChevronLeft,
  UserSearch,
  Sparkles,
} from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { useFeatureAccess } from '@/components/hooks/useFeatureAccess';
import { useAccountAnalysisApi } from '@/components/hooks/useAccountAnalysisApi';
import { useAccountAnalysis } from '@/components/hooks/useAccountAnalysis';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

/**
 * 🎯 ONBOARDING TIKTOK ANALYSIS - VERSION ASYNCHRONE
 *
 * Écran d'onboarding pour lancer l'analyse TikTok de manière asynchrone
 * L'utilisateur peut continuer l'onboarding pendant que l'analyse se déroule
 */
export default function TikTokAnalysisScreen() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const { hasAccess, isLoading: isAccessLoading } =
    useFeatureAccess('account_analysis');
  const { startAnalysis, isLoading: isApiLoading } = useAccountAnalysisApi();
  const { analysis: existingAnalysis, isLoading: isAnalysisLoading } =
    useAccountAnalysis();
  const { nextStep } = useOnboarding();
  const { presentPaywall } = useRevenueCat();

  const handleStartAnalysis = async () => {
    if (!handle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de compte TikTok.');
      return;
    }

    try {
      await startAnalysis(handle.trim());
      Alert.alert(
        'Analyse Lancée !',
        `Nous avons commencé à analyser le compte @${handle.trim()}. Nous vous notifierons quand le rapport sera prêt.`
      );
      // Navigate to the end of onboarding
      router.push('/(onboarding)/success');
    } catch (error: any) {
      Alert.alert(
        "Erreur d'API",
        error.message || "Impossible de lancer l'analyse."
      );
    }
  };

  const handleSkip = () => {
    nextStep();
  };

  if (isAccessLoading || isAnalysisLoading) {
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
      <FeatureLock requiredPlan="creator" onLockPress={presentPaywall}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analyse de Compte</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <UserSearch size={64} color="#007AFF" />
            </View>
            <Text style={styles.title}>Analyse de Compte Approfondie</Text>
            <Text style={styles.description}>
              Obtenez une analyse complète de n&apos;importe quel compte TikTok,
              identifiez les stratégies virales et recevez des recommandations
              personnalisées.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={presentPaywall}
            >
              <Text style={styles.startButtonText}>
                Débloquer avec le Plan Créateur
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </FeatureLock>
    );
  }

  if (existingAnalysis) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analyse de Compte</Text>
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
          <Text style={styles.title}>Analyse Déjà Effectuée</Text>
          <Text style={styles.description}>
            Vous avez déjà une analyse de compte active. Vous pouvez la
            consulter dans la section &quot;Analyse&quot;.
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse de Compte</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <UserSearch size={64} color="#007AFF" />
        </View>
        <Text style={styles.title}>Analysez un Compte TikTok</Text>
        <Text style={styles.description}>
          Entrez le @handle d&apos;un compte pour que notre IA analyse sa
          stratégie de contenu, ses performances et ses métriques
          d&apos;audience.
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="nomducompte"
            placeholderTextColor="#666"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.startButton, isApiLoading && styles.buttonDisabled]}
          onPress={handleStartAnalysis}
          disabled={isApiLoading}
        >
          {isApiLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Sparkles size={20} color="#fff" />
              <Text style={styles.startButtonText}>Lancer l&apos;Analyse</Text>
            </>
          )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 24,
  },
  atSymbol: {
    color: '#888',
    fontSize: 18,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingVertical: 16,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
