import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { Play, Trash, Upload, Mic, Send } from 'lucide-react-native';
import { useVoiceRecording } from '@/components/hooks/useVoiceRecording';
import { useVoices } from './hooks/useVoices';
import { VoiceRecordingModal } from './VoiceRecordingModal';
import { VoiceConfig } from '@/lib/services/voiceService';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

const ACCEPTED_FORMATS_LABEL =
  'AAC, AIFF, OGG, MP3, OPUS, WAV, FLAC, M4A, WEBM';
const MAX_RECORDINGS = 3;

const RECORDING_INSTRUCTIONS = [
  'Parlez clairement dans le microphone',
  'Évitez le bruit de fond et les interruptions',
  '1 à 2 minutes recommandé, 3 max',
  'Format : mono, pas de musique, pas d’effets',
];

export const VoiceRecordingUI: React.FC<{
  handleUpdateVoices?: (voice: VoiceConfig) => void;
}> = ({ handleUpdateVoices }) => {
  const { data: voicesData, actions: voicesActions } = useVoices({
    handleUpdateVoices,
  });
  // Only local state: show/hide recording modal/flow
  const [showRecorder, setShowRecorder] = useState(false);

  // Setup useVoiceRecording with handlers
  const voiceRecording = useVoiceRecording({
    onSuccess: async (result) => {
      await voicesActions.handleRecordingComplete(result);
      setShowRecorder(false);
    },
    onError: (error) => {
      voicesActions.handleRecordingError(error);
      setShowRecorder(false);
    },
    autoSubmit: true,
  });

  // UI state
  const { recordings, isSubmitting, error } = voicesData;
  const name = voicesData.name ?? '';

  // Handlers
  const handleStartRecording = () => {
    setShowRecorder(true);
    voiceRecording.actions.reset();
    voiceRecording.actions.startRecording();
  };

  const handleCancelRecording = () => {
    setShowRecorder(false);
    voiceRecording.actions.cancelRecording();
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Card nom de la voix */}
      <View style={styles.card}>
        <Text style={styles.label}>Nom de la voix</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={voicesActions.setName}
          placeholder="Entrez le nom de la voix"
          placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
        />
      </View>

      {/* Card instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Conseils pour un bon enregistrement
        </Text>
        {RECORDING_INSTRUCTIONS.map((inst, idx) => (
          <Text key={idx} style={styles.instructionText}>
            • {inst}
          </Text>
        ))}
      </View>

      {/* Card enregistrements */}
      <View style={styles.card}>
        <FlatList
          data={recordings}
          keyExtractor={(item, idx) => item.uri + idx}
          renderItem={({ item, index }) => (
            <View style={styles.recordingMiniCard}>
              <Text style={styles.recordingName}>{item.name}</Text>
              <View style={styles.recordingActions}>
                <TouchableOpacity
                  onPress={() => voicesActions.playSound(item.uri, index)}
                  style={styles.roundButton}
                >
                  <Play size={18} color={SHARED_STYLE_COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => voicesActions.deleteRecording(index)}
                  style={[styles.roundButton, styles.deleteButton]}
                >
                  <Trash size={18} color={SHARED_STYLE_COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun enregistrement</Text>
          }
          scrollEnabled={false}
        />
      </View>

      {/* Card actions */}
      <View style={styles.cardActions}>
        <View style={styles.actionRowCentered}>
          <TouchableOpacity
            style={[
              styles.actionButtonSmall,
              recordings.length >= MAX_RECORDINGS && styles.disabledButton,
            ]}
            onPress={handleStartRecording}
            disabled={recordings.length >= MAX_RECORDINGS}
          >
            <Mic size={20} color={SHARED_STYLE_COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButtonSmall,
              recordings.length >= MAX_RECORDINGS && styles.disabledButton,
            ]}
            onPress={voicesActions.pickAudio}
            disabled={recordings.length >= MAX_RECORDINGS}
          >
            <Upload size={20} color={SHARED_STYLE_COLORS.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.formatsLabel}>
          Formats acceptés : {ACCEPTED_FORMATS_LABEL}
        </Text>
      </View>

      {/* Bouton soumettre */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!name.trim() || recordings.length === 0) && styles.disabledButton,
        ]}
        onPress={voicesActions.handleSubmit}
        disabled={!name.trim() || recordings.length === 0 || isSubmitting}
      >
        <Send size={20} color={SHARED_STYLE_COLORS.text} />
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Envoi...' : 'Soumettre'}
        </Text>
      </TouchableOpacity>

      {/* Feedback erreur */}
      {error && (
        <View style={styles.feedbackCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Espace pour éviter que le bouton soit collé en bas */}
      <View style={{ height: 40 }} />

      {/* Recording Modal/Overlay */}
      <VoiceRecordingModal
        visible={showRecorder}
        onRequestClose={handleCancelRecording}
        voiceRecording={voiceRecording}
        voicesActions={voicesActions}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: {
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActions: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  sectionLabel: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  instructionText: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 2,
  },
  recordingMiniCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingName: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roundButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 50,
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: SHARED_STYLE_COLORS.error,
  },
  emptyText: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  actionRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 8,
  },
  actionButtonSmall: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 32,
    padding: 18,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonLarge: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: SHARED_STYLE_COLORS.success,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  formatsLabel: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
  feedbackCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: SHARED_STYLE_COLORS.success,
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  recorderModal: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  timerText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
});

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
