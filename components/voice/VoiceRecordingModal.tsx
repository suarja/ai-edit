import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const VoiceRecordingModal = ({
  visible,
  onRequestClose,
  voiceRecording,
  voicesActions,
}: {
  visible: boolean;
  onRequestClose: () => void;
  voiceRecording: any;
  voicesActions: any;
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.recorderModal}>
          {/* Error state */}
          {voiceRecording.state.error ? (
            <>
              <Text style={styles.errorText}>
                {voiceRecording.state.error.message}
              </Text>
              <TouchableOpacity
                style={styles.actionButtonSmall}
                onPress={() => {
                  voiceRecording.actions.reset();
                  voiceRecording.actions.startRecording();
                }}
              >
                <Text style={styles.buttonText}>Réessayer</Text>
              </TouchableOpacity>
            </>
          ) : voiceRecording.state.isProcessing ? (
            // Uploading state
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.sectionLabel}>
                Enregistrement en cours de traitement…
              </Text>
            </>
          ) : voiceRecording.state.isRecording ? (
            // Recording state
            <>
              <Text style={styles.sectionLabel}>Enregistrement en cours</Text>
              <Text style={styles.timerText}>
                {formatDuration(voiceRecording.state.recordingDuration)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButtonLarge,
                  { backgroundColor: '#ef4444', marginTop: 24 },
                ]}
                onPress={voiceRecording.actions.stopRecording}
                disabled={!voiceRecording.status.canStop}
              >
                <Text style={styles.buttonText}>Arrêter</Text>
              </TouchableOpacity>
            </>
          ) : voiceRecording.state.isCompleted &&
            voiceRecording.state.recordingUri ? (
            // Review state
            <>
              <Text style={styles.sectionLabel}>Enregistrement terminé</Text>
              <Text style={styles.timerText}>
                Durée : {formatDuration(voiceRecording.state.recordingDuration)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    voicesActions.playSound(
                      voiceRecording.state.recordingUri,
                      0
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Écouter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    voiceRecording.actions.reset();
                    voiceRecording.actions.startRecording();
                  }}
                >
                  <Text style={styles.buttonText}>Réenregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButtonSmall,
                    { backgroundColor: '#10b981' },
                  ]}
                  onPress={voiceRecording.actions.submitRecording}
                  disabled={!voiceRecording.status.canSubmit}
                >
                  <Text style={styles.buttonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Idle state
            <>
              <Text style={styles.sectionLabel}>Prêt à enregistrer</Text>
              <TouchableOpacity
                style={[
                  styles.actionButtonLarge,
                  { backgroundColor: '#007AFF', marginTop: 24 },
                ]}
                onPress={voiceRecording.actions.startRecording}
                disabled={!voiceRecording.status.canStart}
              >
                <Text style={styles.buttonText}>Démarrer l’enregistrement</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  recorderModal: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButtonLarge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonSmall: {
    backgroundColor: '#007AFF',
    borderRadius: 32,
    padding: 18,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
