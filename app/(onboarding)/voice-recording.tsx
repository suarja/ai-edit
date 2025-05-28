import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mic, CircleStop as StopCircle, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';

const MAX_RECORDING_DURATION = 120000; // 2 minutes in milliseconds

const ONBOARDING_STEPS = [
  'welcome',
  'survey',
  'voice-recording',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

export default function VoiceRecordingScreen() {
  const { nextStep, previousStep, markStepCompleted, surveyAnswers } =
    useOnboarding();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  // Monitor recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const duration = Date.now() - startTime;
        setRecordingDuration(duration);

        if (duration >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => console.log('Recording status:', status),
        100
      );

      setRecording(recording);
      setIsRecording(true);
      setError(null);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError("Échec de la démarrage de l'enregistrement");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Only process if we have recorded for at least 1 second
      if (recordingDuration < 1000) {
        setError(
          "L'enregistrement est trop court. Veuillez enregistrer pendant au moins 1 seconde."
        );
        recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error("Impossible d'obtenir l'URI d'enregistrement");
      }

      // Get recording status to verify we have data
      const status = await recording.getStatusAsync();
      console.log('Recording status after stop:', status);

      // Verify file exists and has content
      const response = await fetch(uri);
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("L'enregistrement est vide");
      }

      console.log('Recording file size:', blob.size);
      await processRecording(uri);

      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError("Échec de l'arrêt de l'enregistrement");
    }
  };

  const processRecording = async (uri: string) => {
    try {
      setProcessing(true);
      setError(null);
      setProgress("Préparation de l'audio...");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const response = await fetch(uri);
      const blob = await response.blob();

      if (blob.size > 10 * 1024 * 1024) {
        throw new Error(
          "L'enregistrement est trop volumineux. Veuillez essayer un message plus court."
        );
      }

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/x-m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('userId', user.id);

      // Include survey answers in the request
      Object.entries(surveyAnswers).forEach(([key, value]) => {
        formData.append(`survey_${key}`, value);
      });

      setProgress("Transcription de l'audio...");

      const result = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-onboarding`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!result.ok) {
        const error = await result.json();
        throw new Error(
          error.error || "Échec du traitement de l'enregistrement"
        );
      }

      setProgress('Configuration de votre profil...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark step as completed and proceed to next step
      markStepCompleted('voice-recording');
      nextStep();
    } catch (err) {
      console.error('Error processing recording:', err);
      setError(err.message || "Échec du traitement de l'enregistrement");
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const handleSkip = () => {
    markStepCompleted('voice-recording');
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={ONBOARDING_STEPS}
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

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Configuration rapide</Text>
          <Text style={styles.instructionText}>
            Enregistrez une brève présentation à propos de :
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • Votre style de contenu et sujets
            </Text>
            <Text style={styles.bulletPoint}>• Votre audience cible</Text>
            <Text style={styles.bulletPoint}>• Votre ton de voix préféré</Text>
          </View>
          <Text style={styles.note}>
            Nous l'utiliserons pour créer un clone vocal IA naturel
          </Text>
          <Text style={styles.timeLimit}>
            Durée d'enregistrement maximum : 2 minutes
          </Text>
        </View>

        {isRecording && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              Enregistrement : {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}

        {processing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>{progress}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <StopCircle size={32} color="#ef4444" />
                <Text style={[styles.recordButtonText, styles.recordingText]}>
                  Arrêter l'enregistrement
                </Text>
              </>
            ) : (
              <>
                <Mic size={32} color="#fff" />
                <Text style={styles.recordButtonText}>
                  Démarrer l'enregistrement
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>
            Je préfère écrire à la place
          </Text>
          <ArrowRight size={20} color="#888" />
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
  instructions: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
  },
  bulletPoints: {
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#888',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  timeLimit: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  durationContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  durationText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  recordingButton: {
    backgroundColor: '#2D1116',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingText: {
    color: '#ef4444',
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
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
  },
});
