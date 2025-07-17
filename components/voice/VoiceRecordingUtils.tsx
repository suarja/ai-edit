import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';

import {
  useVoiceRecordingContext,
} from './VoiceRecordingContext';

// Format duration helper
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Duration display component
export const VoiceRecordingTimer: React.FC = () => {
  const { state } = useVoiceRecordingContext();

  if (!state.isRecording && state.recordingDuration === 0) {
    return null;
  }

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>
        {state.isRecording ? 'Enregistrement : ' : 'Durée : '}
        {formatDuration(state.recordingDuration)}
      </Text>
    </View>
  );
};

// Progress display component
export const VoiceRecordingProgress: React.FC = () => {
  const { state } = useVoiceRecordingContext();

  if (!state.progress) {
    return null;
  }

  return (
    <View style={styles.progressContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.progressText}>{state.progress.message}</Text>
    </View>
  );
};

// Error display component
export const VoiceRecordingError: React.FC = () => {
  const { state, actions } = useVoiceRecordingContext();

  if (!state.error) {
    return null;
  }

  return (
    <View style={styles.errorContainer}>
      <AlertCircle size={20} color="#ef4444" />
      <Text style={styles.errorText}>{state.error.message}</Text>
      {state.error.recoverable && (
        <TouchableOpacity
          style={styles.errorRetryButton}
          onPress={actions.retry}
        >
          <RefreshCw size={16} color="#007AFF" />
          <Text style={styles.errorRetryText}>Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Instructions component
interface VoiceRecordingInstructionsProps {
  variant?: 'onboarding' | 'settings';
  customInstructions?: string[];
}

export const VoiceRecordingInstructions: React.FC<
  VoiceRecordingInstructionsProps
> = ({ variant = 'onboarding', customInstructions }) => {
  const defaultOnboardingInstructions = [
    'Votre style de contenu et sujets',
    'Votre audience cible',
    'Votre ton de voix préféré',
  ];

  const defaultSettingsInstructions = [
    'Parlez clairement dans le microphone',
    'Enregistrez pendant au moins 3 secondes',
    'Évitez les bruits de fond',
  ];

  const instructions =
    customInstructions ||
    (variant === 'onboarding'
      ? defaultOnboardingInstructions
      : defaultSettingsInstructions);

  const title =
    variant === 'onboarding'
      ? 'Enregistrez une brève présentation à propos de :'
      : "Instructions d'enregistrement :";

  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionTitle}>{title}</Text>
      <View style={styles.bulletPoints}>
        {instructions.map((instruction, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {instruction}
          </Text>
        ))}
      </View>
      <Text style={styles.note}>
        {variant === 'onboarding'
          ? 'Nous l&apos;utiliserons pour créer un clone vocal IA naturel'
          : 'Enregistrement de qualité pour de meilleurs résultats'}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  // Timer styles
  timerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  // Progress styles
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
  },
  // Error styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  errorRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorRetryText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Instructions styles
  instructionsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
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


  
});
