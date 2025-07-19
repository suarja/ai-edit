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
  const { isPro, isReady, goPro } = useRevenueCat();

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
        enableVoiceClone: wantsVoiceClone && isPro, // Only enable if user wants it AND is pro
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
    if (isPro) {
      setWantsVoiceClone(true);
      setRecordingMode(true);
    } else {
      setShowVoiceClonePaywall(true);
    }
  };

  const handleUpgradeToPro = async () => {
    try {
      const success = await goPro();
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
          <ActivityIndicator size="large" color="#007AFF" />
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
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.progressText}>
                {progress || 'Traitement en cours...'}
              </Text>
            </View>
          )}

          {showVoiceClonePaywall && (
            <View style={styles.paywallContainer}>
              <View style={styles.paywallHeader}>
                <Crown size={32} color="#FFD700" />
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
              >
                <Zap size={20} color="#fff" />
                <Text style={styles.upgradeButtonText}>Passer Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueWithoutButton}
                onPress={handleStartRecording}
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
              >
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

          {!recordingMode && !showVoiceClonePaywall && (
            <View style={styles.optionsContainer}>
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.optionTitle}>Clonage Vocal IA</Text>
                  {!isPro && <Text style={styles.proBadge}>PRO</Text>}
                </View>
                <Text style={styles.optionDescription}>
                  Créez votre clone vocal pour générer des vidéos avec votre
                  propre voix
                </Text>
                <TouchableOpacity
                  style={[styles.optionButton, styles.voiceCloneButton]}
                  onPress={handleVoiceCloneRequest}
                >
                  <Text style={styles.voiceCloneButtonText}>
                    {isPro ? 'Créer mon clone vocal' : 'Découvrir (Pro)'}
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
                >
                  <Text style={styles.optionButtonText}>
                    Enregistrer ma voix
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isCompleted ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isProcessing}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <ArrowRight size={20} color="#fff" />
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
              >
                <Text
                  style={[
                    styles.skipButtonText,
                    isProcessing && styles.disabledText,
                  ]}
                >
                  Je préfère écrire à la place
                </Text>
                <ArrowRight size={20} color={isProcessing ? '#555' : '#888'} />
              </TouchableOpacity>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
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
    justifyContent: 'space-between',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  progressText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  paywallContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
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
    color: '#fff',
  },
  paywallDescription: {
    fontSize: 16,
    color: '#ccc',
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
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  continueWithoutButton: {
    alignItems: 'center',
    padding: 16,
  },
  continueWithoutText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  continueWithoutSubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    color: '#fff',
    flex: 1,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  voiceCloneButton: {
    backgroundColor: '#FFD700',
  },
  profileButton: {
    backgroundColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  voiceCloneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  recordingContainer: {
    gap: 16,
  },
  backButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
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
  disabledText: {
    color: '#555',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
