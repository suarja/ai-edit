import { useVoiceRecordingContext } from './VoiceRecordingContext';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mic, StopCircle, Send } from 'lucide-react-native';
import { formatDuration, VoiceRecordingProgress } from './VoiceRecordingUtils';
// Recording controls component
interface VoiceRecordingControlsProps {
  variant?: 'onboarding' | 'settings';
}
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
            Cliquez sur SOUMETTRE pour l&apos;ajouter à votre liste
          </Text>
        </View>
      )}
    </View>
  );
};

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
            <Text style={styles.stopButtonText}>
              ARRÊTER L&apos;ENREGISTREMENT
            </Text>
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
            Démarrer l&apos;enregistrement
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
        <Text style={styles.emergencyResetText}>🔄 RESET D&apos;URGENCE</Text>
      </TouchableOpacity>
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
