import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TrendingUp, Search, Brain, Target, CheckCircle, ArrowRight, Clock } from 'lucide-react-native';
import { useTikTokAnalysis } from '@/hooks/useTikTokAnalysis';
import { useRevenueCat } from '@/providers/RevenueCat';
import { useOnboarding } from '@/components/providers/OnboardingProvider';

/**
 * 🎯 ONBOARDING TIKTOK ANALYSIS - VERSION ASYNCHRONE
 * 
 * Écran d'onboarding pour lancer l'analyse TikTok de manière asynchrone
 * L'utilisateur peut continuer l'onboarding pendant que l'analyse se déroule
 */
export default function TikTokAnalysisOnboarding() {
  const [tiktokHandle, setTikTokHandle] = useState('');
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isPro, goPro } = useRevenueCat();
  const { nextStep } = useOnboarding();
  
  const {
    startAnalysis,
    isAnalyzing,
    error,
  } = useTikTokAnalysis();

  const handleStartAnalysis = async () => {
    if (!tiktokHandle.trim()) {
      Alert.alert('Handle requis', 'Veuillez entrer votre handle TikTok');
      return;
    }

    if (!isPro) {
      Alert.alert(
        'Fonctionnalité Pro',
        'L\'analyse TikTok est réservée aux utilisateurs Pro. Souhaitez-vous upgrader ?',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Upgrader', onPress: () => goPro() },
        ]
      );
      return;
    }

    try {
      console.log('🚀 Starting TikTok analysis for:', tiktokHandle);
      await startAnalysis(tiktokHandle.replace('@', '').trim());
      setAnalysisStarted(true);
      setShowSuccess(true);
      
      // Auto-continue after showing success
      setTimeout(() => {
        nextStep();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      Alert.alert(
        'Erreur',
        'Impossible de démarrer l\'analyse. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSkip = () => {
    nextStep();
  };

  const handleContinue = () => {
    nextStep();
  };

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <CheckCircle size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>Analyse Lancée !</Text>
            <Text style={styles.successSubtitle}>
              Votre analyse TikTok est en cours. Vous pourrez consulter les résultats dans l'onglet Account Chat une fois terminée.
            </Text>
            <View style={styles.processingInfo}>
              <Clock size={16} color="#888" />
              <Text style={styles.processingText}>
                Temps estimé : 2-3 minutes
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TrendingUp size={48} color="#FF6B35" />
          <Text style={styles.title}>Analyse TikTok</Text>
          <Text style={styles.subtitle}>
            Créez votre profil éditorial personnalisé basé sur vos performances TikTok
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Brain size={24} color="#007AFF" />
            <Text style={styles.featureText}>Analyse IA de votre contenu</Text>
          </View>
          <View style={styles.feature}>
            <Target size={24} color="#007AFF" />
            <Text style={styles.featureText}>Recommandations personnalisées</Text>
          </View>
          <View style={styles.feature}>
            <Search size={24} color="#007AFF" />
            <Text style={styles.featureText}>Insights d'audience</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Votre handle TikTok</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.input}
              value={tiktokHandle}
              onChangeText={setTikTokHandle}
              placeholder="votre_handle"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {!isPro && (
          <View style={styles.proNotice}>
            <Text style={styles.proNoticeText}>
              💎 Fonctionnalité Pro requise
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, isAnalyzing && styles.disabledButton]}
            onPress={handleStartAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Brain size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Analyser mon TikTok</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Plus tard</Text>
            <ArrowRight size={16} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          L'analyse prendra 2-3 minutes. Vous pouvez continuer l'onboarding pendant ce temps.
        </Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 50,
  },
  atSymbol: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 0,
  },
  proNotice: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  proNoticeText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingText: {
    fontSize: 14,
    color: '#888',
  },
}); 