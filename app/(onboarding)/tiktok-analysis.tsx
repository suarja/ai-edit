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
import { TrendingUp, Search, Brain, Target, CheckCircle } from 'lucide-react-native';
import { useTikTokAnalysis } from '@/hooks/useTikTokAnalysis';
import { useRevenueCat } from '@/providers/RevenueCat';

/**
 * 🎯 ONBOARDING TIKTOK ANALYSIS
 * 
 * Écran d'onboarding pour lancer l'analyse TikTok avec cérémonial
 * Intégré dans le flow d'onboarding après voice recording
 */
export default function TikTokAnalysisOnboarding() {
  const [tiktokHandle, setTikTokHandle] = useState('');
  const [showCeremony, setShowCeremony] = useState(false);
  const { isPro, goPro } = useRevenueCat();
  
  const {
    startAnalysis,
    isAnalyzing,
    progress,
    status,
    statusMessage,
    error,
    clearError,
  } = useTikTokAnalysis();

  // Animation pour le cérémonial
  const [ceremonyStep, setCeremonyStep] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const ceremonySteps = [
    {
      icon: Search,
      title: 'Analyse de votre profil',
      description: 'Collecte de vos données TikTok...',
      color: '#FF6B6B',
    },
    {
      icon: Brain,
      title: 'Intelligence artificielle',
      description: 'Analyse de vos contenus et performances...',
      color: '#4ECDC4',
    },
    {
      icon: Target,
      title: 'Stratégie personnalisée',
      description: 'Génération de recommandations sur mesure...',
      color: '#45B7D1',
    },
    {
      icon: CheckCircle,
      title: 'Profil éditorial créé',
      description: 'Votre profil est maintenant optimisé !',
      color: '#96CEB4',
    },
  ];

  useEffect(() => {
    if (showCeremony) {
      startCeremonyAnimation();
    }
  }, [showCeremony]);

  useEffect(() => {
    if (isAnalyzing && !showCeremony) {
      setShowCeremony(true);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    // Mettre à jour l'étape du cérémonial selon le statut
    if (status === 'scraping') setCeremonyStep(0);
    else if (status === 'analyzing') setCeremonyStep(1);
    else if (status === 'completed') {
      setCeremonyStep(3);
      // Attendre un peu puis rediriger
      setTimeout(() => {
        router.replace('/voice-clone');
      }, 2000);
    }
  }, [status]);

  const startCeremonyAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStartAnalysis = async () => {
    if (!tiktokHandle.trim()) {
      Alert.alert('Handle requis', 'Veuillez entrer votre handle TikTok');
      return;
    }

    if (!isPro) {
      Alert.alert(
        'Fonctionnalité Pro',
        'L\'analyse TikTok est une fonctionnalité Pro. Souhaitez-vous upgrader ?',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Upgrader', onPress: () => goPro() },
        ]
      );
      return;
    }

    try {
      // Nettoyer le handle (enlever @ si présent)
      const cleanHandle = tiktokHandle.replace('@', '').trim();
      await startAnalysis(cleanHandle);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleSkip = () => {
    router.replace('/voice-clone');
  };

  if (showCeremony) {
    const currentStep = ceremonySteps[ceremonyStep];
    const IconComponent = currentStep.icon;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View
          style={[
            styles.ceremonyContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(progress, 25)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Icône animée */}
          <View style={[styles.iconContainer, { backgroundColor: currentStep.color }]}>
            <IconComponent size={48} color="#fff" />
          </View>

          {/* Titre et description */}
          <Text style={styles.ceremonyTitle}>{currentStep.title}</Text>
          <Text style={styles.ceremonyDescription}>{currentStep.description}</Text>
          
          {/* Status message */}
          <Text style={styles.statusMessage}>{statusMessage}</Text>

          {/* Loading indicator */}
          <ActivityIndicator size="large" color={currentStep.color} style={styles.loader} />

          {/* Steps indicator */}
          <View style={styles.stepsContainer}>
            {ceremonySteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: index <= ceremonyStep ? currentStep.color : '#333',
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TrendingUp size={48} color="#FF6B6B" />
          <Text style={styles.title}>Analyse TikTok</Text>
          <Text style={styles.subtitle}>
            Créons votre profil éditorial personnalisé basé sur votre compte TikTok
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefit}>
            <Brain size={24} color="#4ECDC4" />
            <Text style={styles.benefitText}>Analyse IA de vos contenus</Text>
          </View>
          <View style={styles.benefit}>
            <Target size={24} color="#45B7D1" />
            <Text style={styles.benefitText}>Recommandations personnalisées</Text>
          </View>
          <View style={styles.benefit}>
            <CheckCircle size={24} color="#96CEB4" />
            <Text style={styles.benefitText}>Optimisation de votre stratégie</Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Votre handle TikTok</Text>
          <TextInput
            style={styles.input}
            value={tiktokHandle}
            onChangeText={setTikTokHandle}
            placeholder="@votre_handle"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>OK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Analyser mon TikTok</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
            disabled={isAnalyzing}
          >
            <Text style={styles.secondaryButtonText}>Passer cette étape</Text>
          </TouchableOpacity>
        </View>

        {/* Pro badge */}
        {!isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>✨ Fonctionnalité Pro</Text>
          </View>
        )}
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
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 40,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  errorContainer: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
  },
  errorDismiss: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  errorDismissText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    gap: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
  },
  proBadge: {
    alignItems: 'center',
    marginTop: 24,
  },
  proText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },

  // Ceremony styles
  ceremonyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  progressText: {
    color: '#888',
    fontSize: 14,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ceremonyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ceremonyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loader: {
    marginBottom: 40,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 