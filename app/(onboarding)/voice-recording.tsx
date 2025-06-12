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
} from 'react-native';
import { ArrowRight, Square } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { VoiceRecordingUI } from '@/components/voice/VoiceRecordingUI';
import {
  VoiceRecordingResult,
  VoiceRecordingError,
} from '@/types/voice-recording';
import { submitOnboardingRecording } from '@/lib/api/voice-recording-client';
import { Audio } from 'expo-av';

export default function VoiceRecordingScreen() {
  const onboardingSteps = useOnboardingSteps();
  const { nextStep, previousStep, markStepCompleted, surveyAnswers } =
    useOnboarding();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

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
      const surveyData = {
        user_id: user.id,
        content_goals: surveyAnswers.content_goals || null,
        pain_points: surveyAnswers.pain_points || null,
        content_style: surveyAnswers.content_style || null,
        platform_focus: surveyAnswers.platform_focus || null,
        content_frequency: surveyAnswers.content_frequency || null,
      };

      // Now that the database schema is fixed, we can use the Supabase client directly
      const { error } = await supabase
        .from('onboarding_survey')
        .upsert(surveyData);

      if (error) {
        console.error('Error saving survey data:', error);
        // Log the data for recovery if needed
        console.log('Survey data that failed to save:', surveyData);
        // Continue anyway to not block the user
        return true;
      }

      console.log('Survey data saved successfully');
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
      console.log('⚠️ Soumission déjà en cours ou complétée, ignorer');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgress("Préparation de l'audio...");

      const user = await fetchUser();
      if (!user) throw new Error('Non authentifié');

      // Submit the recording with survey data
      await submitOnboardingRecording({
        uri: result.uri,
        name: result.fileName,
        duration: result.duration,
        fileName: result.fileName,
        surveyData: {
          content_goals: surveyAnswers.content_goals || null,
          pain_points: surveyAnswers.pain_points || null,
          content_style: surveyAnswers.content_style || null,
          platform_focus: surveyAnswers.platform_focus || null,
          content_frequency: surveyAnswers.content_frequency || null,
        },
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
    nextStep();
  };

  const handleSkip = async () => {
    // Protection contre les soumissions multiples
    if (isProcessing || isCompleted) {
      console.log('⚠️ Skip déjà en cours ou complété, ignorer');
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
        console.log('Voice recording skip: auto-advancing to next step');
        nextStep();
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="voice-recording"
        completedSteps={['welcome', 'survey']}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Configuration vocale</Text>
        <Text style={styles.subtitle}>Créez votre clone vocal IA</Text>
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

        <VoiceRecordingUI
          variant="onboarding"
          config={{
            minDuration: 3000, // 3 seconds
            maxDuration: 120000, // 2 minutes
            autoSubmit: true,
          }}
          onComplete={handleRecordingComplete}
          onError={handleRecordingError}
          showInstructions={true}
          showTimer={true}
        />

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
          <TouchableOpacity
            style={[styles.skipButton, isProcessing && styles.disabledButton]}
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
  debugContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  disabledButton: {
    opacity: 0.5,
  },
});
