/**
 * 🎨 Voice Recording Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 2:
 * ❌ Avant: 41 couleurs hardcodées pour paywall et interface d'onboarding
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
/**
 * Voice Recording Screen for Onboarding
 *
 * This component handles the voice recording step of the onboarding process.
 * It allows users to record a brief introduction about their content style, audience,
 * and tone of voice, which is then processed to create an AI voice clone and
 * editorial profile.
 *
 * Users can also skip the recording step, in which case a default profile will be created
 * based on their survey answers.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ArrowRight, Crown, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';
import { VoiceRecordingUI } from '@/components/voice/VoiceRecordingUI';
import {
  VoiceRecordingResult,
  VoiceRecordingError,
} from '@/lib/types/voice-recording';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { VoiceRecordingService } from '@/lib/services/voiceRecordingService';
import { ISurvey } from '@/lib/types/survey.types';
import { COLORS } from '@/lib/constants/colors';

export default function VoiceRecordingScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { markStepCompleted, surveyAnswers } = useOnboarding();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [showVoiceClonePaywall, setShowVoiceClonePaywall] = useState(false);
  const [recordingMode, setRecordingMode] = useState(false);
  const [wantsVoiceClone, setWantsVoiceClone] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();
  const { getToken } = useAuth();
  const { currentPlan, isReady, presentPaywall } = useRevenueCat();

  // Function to save survey data without audio processing
  const saveSurveyData = async (): Promise<boolean> => {
    try {
      setProgress('Enregistrement des données du questionnaire...');

      const user = await fetchUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      // Create survey data object
      const surveyData: ISurvey = {
        user_id: user.id,
        content_goals: surveyAnswers.content_goals || '',
        pain_points: surveyAnswers.pain_points || '',
        content_style: surveyAnswers.content_style || '',
        platform_focus: surveyAnswers.platform_focus || '',
        content_frequency: surveyAnswers.content_frequency || '',
      };

      // Now that the database schema is fixed, we can use the Supabase client directly
      const { error } = await supabase
        .from('onboarding_survey')
        .upsert(surveyData);

      if (error) {
        console.error('Error saving survey data:', error);
        // Log the data for recovery if needed
        // Continue anyway to not block the user
        return true;
      }

      return true;
    } catch (err) {
      console.error('Error in saveSurveyData:', err);
      // Don't block the user experience even if saving fails
      return true;
    }
  };

  const handleRecordingComplete = async (result: VoiceRecordingResult) => {
    // Protection contre les soumissions multiples
    if (isProcessing || isCompleted) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgress("Préparation de l'audio...");

      const user = await fetchUser();
      if (!user) throw new Error('Non authentifié');
      const token = await getToken();
      if (!token) {
        router.push('/(auth)/sign-in');
        return;
      }

      // Submit the recording with survey data and voice clone preference
      await VoiceRecordingService.submitOnboardingRecording({
        uri: result.uri,
        name: result.fileName,
        duration: result.duration,
        fileName: result.fileName,
        token,
        user: user,
        surveyData: {
          content_goals: surveyAnswers.content_goals || null,
          pain_points: surveyAnswers.pain_points || null,
          content_style: surveyAnswers.content_style || null,
          platform_focus: surveyAnswers.platform_focus || null,
          content_frequency: surveyAnswers.content_frequency || null,
        },
        enableVoiceClone: wantsVoiceClone && currentPlan !== 'free', // Only enable if user wants it AND is pro
      });

      setProgress('Configuration de votre profil...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark step as completed - user will manually continue
      markStepCompleted('voice-recording');
      setIsCompleted(true);
    } catch (err: any) {
      console.error('Error processing recording:', err);
      setError(err?.message || "Échec du traitement de l'enregistrement");

      // Offer retry option
      Alert.alert(
        'Erreur de traitement',
        `${
          err?.message ||
          "Une erreur s'est produite lors du traitement de l'enregistrement"
        }. Voulez-vous réessayer?`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Réessayer',
            onPress: () => setError(null),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleRecordingError = (error: VoiceRecordingError) => {
    console.error('Recording error:', error);
    setError(error.message);
  };

  const handleContinue = () => {
    router.replace('/(onboarding)/tiktok-analysis');
  };

  const handleStartRecording = () => {
    setRecordingMode(true);
    setShowVoiceClonePaywall(false);
  };

  const handleVoiceCloneRequest = () => {
    if (currentPlan !== 'free') {
      setWantsVoiceClone(true);
      setRecordingMode(true);
    } else {
      setShowVoiceClonePaywall(true);
    }
  };

  const handleUpgradeToPro = async () => {
    try {
      const success = await presentPaywall();
      if (success) {
        setWantsVoiceClone(true);
        setShowVoiceClonePaywall(false);
        setRecordingMode(true);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleSkip = async () => {
    // Protection contre les soumissions multiples
    if (isProcessing || isCompleted) {
      return;
    }

    try {
      setIsProcessing(true);
      setProgress('Préparation de votre profil...');

      // Save survey data even when skipping audio recording
      await saveSurveyData();

      // Create a default editorial profile based on survey answers
      const user = await fetchUser();

      if (user) {
        // Check if the user already has a profile
        const { data: existingProfile } = await supabase
          .from('editorial_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Only create a default profile if one doesn't exist
        if (!existingProfile) {
          const defaultDescription = surveyAnswers.content_style
            ? `Créateur de contenu axé sur ${surveyAnswers.content_style}`
            : 'Créateur de contenu digital';

          const defaultAudience = surveyAnswers.platform_focus
            ? `Audience sur la plateforme ${surveyAnswers.platform_focus}`
            : 'Audience générale';

          await supabase.from('editorial_profiles').upsert({
            user_id: user.id,
            persona_description: defaultDescription,
            tone_of_voice: 'Professionnel et informatif',
            audience: defaultAudience,
            style_notes: 'Préfère un style concis et direct',
          });
        }
      }

      setProgress('Configuration terminée');

      // Brief delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error('Error during skip handling:', err);
      // Continue despite errors - we don't want to block the user
    } finally {
      setIsProcessing(false);
      setProgress('');
      markStepCompleted('voice-recording');

      // Auto-advance when skipping since user explicitly chose to skip
      // Add a small delay to ensure processing state is cleared
      setTimeout(() => {
        console.log('Voice recording skip: redirecting to TikTok analysis');
        router.replace('/(onboarding)/tiktok-analysis');
      }, 100);
    }
  };

  // Show loading while RevenueCat initializes
  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProgressBar
          steps={onboardingSteps}
          currentStep="voice-recording"
          completedSteps={['welcome', 'survey']}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
          <Text style={styles.loadingText}>Initialisation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="voice-recording"
        completedSteps={['welcome', 'survey']}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Configuration vocale</Text>
          <Text style={styles.subtitle}>Personnalisez votre expérience</Text>
        </View>

        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {(isProcessing || progress) && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={COLORS.interactive.primary} />
              <Text style={styles.progressText}>
                {progress || 'Traitement en cours...'}
              </Text>
            </View>
          )}

          {/* ✅ Paywall avec design Editia */}
          {showVoiceClonePaywall && (
            <View style={styles.paywallContainer}>
              <View style={styles.paywallHeader}>
                <Crown size={32} color={COLORS.brand.gold} />
                <Text style={styles.paywallTitle}>Clonage Vocal Pro</Text>
              </View>

              <Text style={styles.paywallDescription}>
                Le clonage vocal avancé est une fonctionnalité exclusive Pro qui
                vous permet de :
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>
                    Créer votre clone vocal IA
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>
                    Générer des vidéos avec votre voix
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>
                    Voix naturelle et authentique
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToPro}
                activeOpacity={0.8}
              >
                <Zap size={20} color="#000000" />
                <Text style={styles.upgradeButtonText}>Passer Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueWithoutButton}
                onPress={handleStartRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.continueWithoutText}>
                  Continuer sans clonage vocal
                </Text>
                <Text style={styles.continueWithoutSubtext}>
                  (L&apos;enregistrement servira uniquement à créer votre profil
                  éditorial)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {recordingMode && (
            <View style={styles.recordingContainer}>
              <VoiceRecordingUI />

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setRecordingMode(false)}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ✅ Options cards avec palette Editia */}
          {!recordingMode && !showVoiceClonePaywall && (
            <View style={styles.optionsContainer}>
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <Crown size={24} color={COLORS.brand.gold} />
                  <Text style={styles.optionTitle}>Clonage Vocal IA</Text>
                  {currentPlan === 'free' && (
                    <Text style={styles.proBadge}>PRO</Text>
                  )}
                </View>
                <Text style={styles.optionDescription}>
                  Créez votre clone vocal pour générer des vidéos avec votre
                  propre voix
                </Text>
                <TouchableOpacity
                  style={[styles.optionButton, styles.voiceCloneButton]}
                  onPress={handleVoiceCloneRequest}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voiceCloneButtonText}>
                    {currentPlan !== 'free'
                      ? 'Créer mon clone vocal'
                      : 'Découvrir (Pro)'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>Profil Éditorial</Text>
                </View>
                <Text style={styles.optionDescription}>
                  Enregistrez-vous pour créer un profil éditorial personnalisé
                </Text>
                <TouchableOpacity
                  style={[styles.optionButton, styles.profileButton]}
                  onPress={handleStartRecording}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionButtonText}>
                    Enregistrer ma voix
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ✅ Boutons d'action avec palette Editia */}
          {isCompleted ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <ArrowRight size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          ) : (
            !recordingMode &&
            !showVoiceClonePaywall && (
              <TouchableOpacity
                style={[
                  styles.skipButton,
                  isProcessing && styles.disabledButton,
                ]}
                onPress={handleSkip}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.skipButtonText,
                    isProcessing && styles.disabledText,
                  ]}
                >
                  Je préfère écrire à la place
                </Text>
                <ArrowRight 
                  size={20} 
                  color={isProcessing ? COLORS.text.muted : COLORS.text.disabled} 
                />
              </TouchableOpacity>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ Container principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  // ✅ Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    marginTop: 12,
  },
  
  // ✅ Header avec palette Editia
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.divider, // #333333
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary, // #FFFFFF
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
  },
  
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  
  // ✅ Error container avec couleur système
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Error background système
    padding: 12,
    borderRadius: 12, // Radius plus moderne
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    lineHeight: 20,
  },
  
  // ✅ Progress container avec design cohérent
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  progressText: {
    color: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ Paywall avec design premium Or
  paywallContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.brand.gold, // #FFD700 (Or Editia!)
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  paywallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  
  paywallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  
  paywallDescription: {
    fontSize: 16,
    color: COLORS.text.secondary, // #E0E0E0 (plus lisible que #ccc)
    marginBottom: 20,
    lineHeight: 22,
  },
  
  featuresList: {
    marginBottom: 24,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  checkmark: {
    color: COLORS.status.success, // #00FF88 (Vert Editia!)
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  
  featureText: {
    color: COLORS.text.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  
  // ✅ Upgrade button avec Or Editia
  upgradeButton: {
    backgroundColor: COLORS.brand.gold, // #FFD700 (Or Editia!)
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    minHeight: 56, // Touch target accessible
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  upgradeButtonText: {
    color: '#000000', // Texte noir sur fond or
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  continueWithoutButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 48, // Touch target
  },
  
  continueWithoutText: {
    color: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    fontSize: 16,
    fontWeight: '600',
  },
  
  continueWithoutSubtext: {
    color: COLORS.text.disabled, // #808080
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  
  // ✅ Options container amélioré
  optionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  
  optionCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16, // Radius plus moderne
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  
  proBadge: {
    backgroundColor: COLORS.brand.gold, // #FFD700
    color: '#000000', // Texte noir sur fond or
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  optionDescription: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // ✅ Option buttons avec couleurs Editia
  optionButton: {
    borderRadius: 12, // Radius plus moderne
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 48, // Touch target accessible
  },
  
  voiceCloneButton: {
    backgroundColor: COLORS.brand.gold, // #FFD700 (Or Editia!)
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  profileButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  
  voiceCloneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', // Texte noir sur fond or
  },
  
  // ✅ Recording container
  recordingContainer: {
    gap: 16,
  },
  
  backButton: {
    backgroundColor: COLORS.surface.divider, // #333333
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 48,
  },
  
  backButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // ✅ Continue button avec Rouge Editia
  continueButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    minHeight: 56,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  continueButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ✅ Skip button amélioré
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  
  skipButtonText: {
    color: COLORS.text.disabled, // #808080
    fontSize: 16,
  },
  
  disabledText: {
    color: COLORS.text.muted, // #666666
  },
  
  disabledButton: {
    opacity: 0.6,
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE RECORDING:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour boutons principaux et progress
 * • #FFD700 → Maintenu comme couleur Or Editia pour paywall et premium
 * • #4CAF50 (vert) → #00FF88 (Vert Editia) pour checkmarks
 * • #ef4444 → #FF3B30 (Rouge système) pour les erreurs
 * • #888/#ccc → Hiérarchie cohérente (#B0B0B0, #808080, #E0E0E0)
 * 
 * 🎤 AMÉLIORATIONS ONBOARDING:
 * • Paywall premium avec Or Editia et shadows dorées
 * • Boutons d'option avec Rouge Editia pour actions principales
 * • Progress indicator avec Rouge Editia
 * • Cards avec elevation et borders cohérents
 * • Touch targets accessibles (48px minimum)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Shadows colorées par variant (or, rouge, neutre)
 * • Badge PRO avec contraste noir/or optimal
 * • États disabled avec opacités cohérentes
 * • Border radius harmonisé (8px, 12px, 16px)
 * 
 * 41 couleurs hardcodées → Interface d'onboarding cohérente Editia ✨
 */