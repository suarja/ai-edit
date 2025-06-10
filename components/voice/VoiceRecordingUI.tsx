import React, { createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Mic,
  CircleStop as StopCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from 'lucide-react-native';
import {
  VoiceRecordingConfig,
  VoiceRecordingState,
  VoiceRecordingActions,
  VoiceRecordingStatus,
  VoiceRecordingResult,
} from '@/types/voice-recording';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { VoiceRecordingErrorWrapper } from './VoiceRecordingErrorBoundary';

// Context for sharing voice recording state
interface VoiceRecordingContextType {
  state: VoiceRecordingState;
  actions: VoiceRecordingActions;
  status: VoiceRecordingStatus;
}

const VoiceRecordingContext = createContext<VoiceRecordingContextType | null>(
  null
);

// Hook to use voice recording context
export const useVoiceRecordingContext = () => {
  const context = useContext(VoiceRecordingContext);
  if (!context) {
    throw new Error(
      'useVoiceRecordingContext must be used within VoiceRecordingUI'
    );
  }
  return context;
};

// Format duration helper
const formatDuration = (ms: number): string => {
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

// Recording controls component
interface VoiceRecordingControlsProps {
  variant?: 'onboarding' | 'settings';
}

export const VoiceRecordingControls: React.FC<VoiceRecordingControlsProps> = ({
  variant = 'onboarding',
}) => {
  const { state, actions, status } = useVoiceRecordingContext();

  console.log('VoiceRecordingControls render:', {
    isRecording: state.isRecording,
    recordingState: state.recordingState,
    canStart: status.canStart,
    canStop: status.canStop,
    isProcessing: state.isProcessing,
    hasProgress: !!state.progress,
  });

  // SEULEMENT afficher le progress quand on n'enregistre PAS
  // (par exemple lors de la soumission après enregistrement)
  if ((state.isProcessing || state.progress) && !state.isRecording) {
    return <VoiceRecordingProgress />;
  }

  return (
    <View style={styles.controlsContainer}>
      {/* TOUJOURS afficher les deux boutons pour débugger le problème */}
      <Text style={styles.debugText}>
        État: {state.isRecording ? 'Enregistrement' : 'Arrêté'} - CanStop:{' '}
        {status.canStop ? 'Oui' : 'Non'} - State: {state.recordingState}
      </Text>

      {state.isRecording ? (
        <View style={styles.recordingActiveContainer}>
          <Text style={styles.recordingIndicator}>
            🔴 ENREGISTREMENT EN COURS
          </Text>
          <TouchableOpacity
            style={styles.emergencyStopButton}
            onPress={() => {
              console.log('Bouton STOP pressé!');
              actions.stopRecording();
            }}
          >
            <View style={styles.stopButton}>
              <StopCircle size={60} color="#fff" />
            </View>
            <Text style={styles.stopButtonText}>ARRÊTER L'ENREGISTREMENT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            variant === 'settings'
              ? styles.settingsButton
              : styles.onboardingButton,
            !status.canStart && styles.disabledButton,
          ]}
          onPress={() => {
            console.log('Bouton START pressé!');
            actions.startRecording();
          }}
          disabled={!status.canStart}
        >
          <Mic size={24} color="#fff" />
          <Text
            style={
              variant === 'settings'
                ? styles.settingsButtonText
                : styles.onboardingButtonText
            }
          >
            Démarrer l'enregistrement
          </Text>
        </TouchableOpacity>
      )}

      {/* Bouton de secours toujours visible */}
      <TouchableOpacity
        style={styles.emergencyResetButton}
        onPress={() => {
          console.log("Reset d'urgence!");
          actions.reset();
        }}
      >
        <Text style={styles.emergencyResetText}>🔄 RESET D'URGENCE</Text>
      </TouchableOpacity>
    </View>
  );
};

// Composant simplifié pour éliminer la confusion
export const SimpleVoiceRecordingControls: React.FC<
  VoiceRecordingControlsProps
> = ({ variant = 'onboarding' }) => {
  const { state, actions, status } = useVoiceRecordingContext();

  console.log('🎤 SimpleVoiceRecording état:', {
    isRecording: state.isRecording,
    recordingState: state.recordingState,
    canStart: status.canStart,
    canStop: status.canStop,
    canSubmit: status.canSubmit,
    isCompleted: state.isCompleted,
    hasRecordingUri: !!state.recordingUri,
  });

  return (
    <View style={styles.controlsContainer}>
      {/* Affichage d'état simplifié */}
      <View style={styles.stateIndicator}>
        <Text style={styles.stateText}>
          {state.isRecording
            ? '🔴 ENREGISTREMENT'
            : state.isCompleted
            ? '✅ TERMINÉ'
            : '⭕ ARRÊTÉ'}{' '}
          | État: {state.recordingState}
        </Text>
      </View>

      {/* Boutons TOUJOURS visibles */}
      <View style={styles.buttonRow}>
        {!state.isRecording && !state.isCompleted ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              console.log('🎤 START pressé!');
              actions.startRecording();
            }}
            disabled={!status.canStart}
          >
            <Mic size={20} color="#fff" />
            <Text style={styles.buttonText}>DÉMARRER</Text>
          </TouchableOpacity>
        ) : null}

        {state.isRecording ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => {
              console.log('🛑 STOP pressé!');
              actions.stopRecording();
            }}
            disabled={!status.canStop}
          >
            <StopCircle size={20} color="#fff" />
            <Text style={styles.buttonText}>ARRÊTER</Text>
          </TouchableOpacity>
        ) : null}

        {state.isCompleted && status.canSubmit ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              console.log('✅ SUBMIT pressé!');
              actions.submitRecording();
            }}
            disabled={!status.canSubmit}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.buttonText}>SOUMETTRE</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            console.log('🔄 RESET pressé!');
            actions.reset();
          }}
        >
          <Text style={styles.buttonText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* Timer simple */}
      {state.isRecording && (
        <Text style={styles.timerText}>
          ⏱️ {formatDuration(state.recordingDuration)}
        </Text>
      )}

      {/* Info de l'enregistrement terminé */}
      {state.isCompleted && state.recordingUri && (
        <View style={styles.completedInfo}>
          <Text style={styles.completedText}>
            📁 Enregistrement prêt ({formatDuration(state.recordingDuration)})
          </Text>
          <Text style={styles.completedSubtext}>
            Cliquez sur SOUMETTRE pour l'ajouter à votre liste
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles pour le composant simplifié
const simpleStyles = StyleSheet.create({
  stateIndicator: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stateText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

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
          ? "Nous l'utiliserons pour créer un clone vocal IA naturel"
          : 'Enregistrement de qualité pour de meilleurs résultats'}
      </Text>
    </View>
  );
};

// Main VoiceRecordingUI component
interface VoiceRecordingUIProps {
  variant?: 'onboarding' | 'settings';
  config?: VoiceRecordingConfig;
  onComplete?: (result: VoiceRecordingResult) => void;
  onError?: (error: any) => void;
  customInstructions?: string[];
  showInstructions?: boolean;
  showTimer?: boolean;
  className?: string;
}

export const VoiceRecordingUI: React.FC<VoiceRecordingUIProps> = ({
  variant = 'onboarding',
  config,
  onComplete,
  onError,
  customInstructions,
  showInstructions = true,
  showTimer = true,
  className,
}) => {
  // Merge config with variant-specific defaults
  const mergedConfig: VoiceRecordingConfig = {
    variant,
    onSuccess: onComplete,
    onError,
    ...config,
  };

  const voiceRecording = useVoiceRecording(mergedConfig);

  return (
    <VoiceRecordingErrorWrapper onError={onError}>
      <VoiceRecordingContext.Provider value={voiceRecording}>
        <View style={[styles.container, className && { ...className }]}>
          {/* Instructions */}
          {showInstructions && (
            <VoiceRecordingInstructions
              variant={variant}
              customInstructions={customInstructions}
            />
          )}

          {/* Error Display */}
          <VoiceRecordingError />

          {/* Timer */}
          {showTimer && <VoiceRecordingTimer />}

          {/* Recording Controls */}
          <SimpleVoiceRecordingControls variant={variant} />
        </View>
      </VoiceRecordingContext.Provider>
    </VoiceRecordingErrorWrapper>
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
  // Onboarding button styles
  onboardingButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    width: '100%',
  },
  onboardingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  onboardingRecordingButton: {
    backgroundColor: '#2D1116',
  },
  // Settings button styles
  settingsButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsRecordingButton: {
    backgroundColor: '#ef4444',
  },
  // Common styles
  recordingText: {
    color: '#ef4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Controls container
  controlsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Stop button styles - redesigned to be much more prominent
  stopButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stopButton: {
    width: 80, // Plus grand pour être plus visible
    height: 80, // Plus grand pour être plus visible
    borderRadius: 40,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  stopButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingActiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  recordingIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emergencyStopButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
  },
  emergencyResetButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  emergencyResetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  stateIndicator: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stateText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  completedInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completedSubtext: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
