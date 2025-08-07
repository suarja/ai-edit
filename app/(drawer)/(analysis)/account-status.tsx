import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { TrendingUp, Sparkles, BarChart3 } from 'lucide-react-native';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import AnalysisInProgressScreen from '@/components/analysis/AnalysisInProgressScreen';
import { JobType } from '@/components/hooks/useAccountAnalysis';

// Design System v2 Colors
const COLORS = {
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#B0B0B0',
  },
  interactive: {
    primary: '#FF0050',
    primaryHover: 'rgba(255, 0, 80, 0.8)',
    primaryBackground: 'rgba(255, 0, 80, 0.12)',
    primaryBorder: 'rgba(255, 0, 80, 0.3)',
  },
  surface: {
    border: 'rgba(255, 255, 255, 0.2)',
    borderActive: '#FF0050',
  },
  shadow: {
    primary: '#FF0050',
  },
};

export default function AccountStatusScreen() {
  const {
    analysis,
    activeJob,
    isLoading,
    error,
    startAnalysis,
    refreshAnalysis,
    hasAnalysis,
    isAnalysisInProgress,
  } = useAnalysisContext();

  const [tiktokHandle, setTiktokHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // NO AUTOMATIC REDIRECTS - let the user navigate manually or show appropriate content

  const handleStartAnalysis = async () => {
    if (!tiktokHandle.trim()) {
      setSubmitError("Veuillez entrer un nom d'utilisateur TikTok.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await startAnalysis(tiktokHandle.trim());
      setTiktokHandle('');
    } catch (error: any) {
      setSubmitError(error.message || "Impossible de lancer l'analyse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    refreshAnalysis();
  };

  // Chargement initial
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Job en cours - afficher l'écran de progression
  if (isAnalysisInProgress && activeJob) {
    return (
      <SafeAreaView style={styles.container}>
        <AnalysisInProgressScreen
          initialJob={activeJob as JobType}
          onAnalysisComplete={refreshAnalysis}
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  // Si on a une analyse complète, proposer d'aller aux insights
  if (hasAnalysis && analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <AnalysisHeader
          title="Analyse TikTok"
          onBack={() => router.back()}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BarChart3 size={48} color={COLORS.interactive.primary} />
            </View>
            <Text style={styles.title}>Analyse terminée !</Text>
            <Text style={styles.subtitle}>
              Votre analyse TikTok pour @{analysis.tiktok_handle} est prête.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(drawer)/(analysis)/account-insights')}
            >
              <Text style={styles.primaryButtonText}>
                Voir les insights
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(drawer)/(analysis)/account-conversations')}
            >
              <Text style={styles.secondaryButtonText}>
                Accéder au chat IA
              </Text>
            </TouchableOpacity>

          
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Aucune analyse - afficher le formulaire de démarrage
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AnalysisHeader
          title="Analyse TikTok"
          onBack={() => router.back()}
        />
        
        <View style={styles.content}>
          {/* Icône et titre */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <TrendingUp size={48} color={COLORS.interactive.primary} />
            </View>
            <Text style={styles.title}>Analysez votre compte TikTok</Text>
            <Text style={styles.subtitle}>
              Obtenez des insights personnalisés et des recommandations basées sur l'IA pour optimiser votre stratégie de contenu.
            </Text>
          </View>

          {/* Fonctionnalités */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <BarChart3 size={20} color={COLORS.interactive.primary} />
              <Text style={styles.featureText}>Analyse complète de vos performances</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color={COLORS.interactive.primary} />
              <Text style={styles.featureText}>Recommandations personnalisées par IA</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Nom d'utilisateur TikTok</Text>
            <View style={[
              styles.inputContainer,
              error && styles.inputError
            ]}>
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="handle"
                placeholderTextColor={COLORS.text.tertiary}
                value={tiktokHandle}
                onChangeText={(text) => {
                  setTiktokHandle(text.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase());
                  setSubmitError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleStartAnalysis}
                returnKeyType="go"
                editable={!isSubmitting}
              />
            </View>

            {/* Erreurs */}
            {(submitError || error) && (
              <Text style={styles.errorText}>
                {submitError || error}
              </Text>
            )}

            {/* Bouton principal */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!tiktokHandle.trim() || isSubmitting) && styles.buttonDisabled
              ]}
              onPress={handleStartAnalysis}
              disabled={!tiktokHandle.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.text.primary} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Lancer l'analyse
                </Text>
              )}
            </TouchableOpacity>

            {/* Bouton secondaire pour naviguer vers chat */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(drawer)/(analysis)/account-conversations')}
            >
              <Text style={styles.secondaryButtonText}>
                Accéder aux conversations
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.interactive.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.interactive.primaryBorder,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Features
  featuresContainer: {
    marginBottom: 40,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    flex: 1,
  },

  // Form
  formContainer: {
    gap: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },

  // Buttons - Design System v2
  primaryButton: {
    backgroundColor: COLORS.interactive.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 44,
  },
  secondaryButtonText: {
    color: COLORS.text.tertiary,
    fontSize: 15,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});