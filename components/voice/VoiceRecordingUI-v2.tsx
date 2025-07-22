/**
 * 🎨 VoiceRecordingUI v2 - Migré vers la Palette Editia
 * 
 * MIGRATION:
 * ❌ Avant: 35+ couleurs hardcodées (#007AFF, #ef4444, #10b981, #18181b, #23232a, etc.)
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

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
import { VoiceRecordingModalV2 } from './VoiceRecordingModal-v2';
import { VoiceConfig } from '@/lib/services/voiceService';
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

const ACCEPTED_FORMATS_LABEL =
  'AAC, AIFF, OGG, MP3, OPUS, WAV, FLAC, M4A, WEBM';
const MAX_RECORDINGS = 3;

const RECORDING_INSTRUCTIONS = [
  'Parlez clairement dans le microphone',
  'Évitez le bruit de fond et les interruptions',
  '1 à 2 minutes recommandé, 3 max',
  'Format : mono, pas de musique, pas d\'effets',
];

export const VoiceRecordingUIV2: React.FC<{
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
      {/* ✅ Card nom de la voix */}
      <View style={styles.card}>
        <Text style={styles.label}>Nom de la voix</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={voicesActions.setName}
          placeholder="Entrez le nom de la voix"
          placeholderTextColor={COLORS.text.disabled} // ✅ #808080
        />
      </View>

      {/* ✅ Card instructions */}
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

      {/* ✅ Card enregistrements */}
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
                  activeOpacity={0.8}
                >
                  <Play size={18} color={COLORS.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => voicesActions.deleteRecording(index)}
                  style={[styles.roundButton, styles.deleteButton]}
                  activeOpacity={0.8}
                >
                  <Trash size={18} color={COLORS.text.primary} />
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

      {/* ✅ Card actions */}
      <View style={styles.cardActions}>
        <View style={styles.actionRowCentered}>
          <TouchableOpacity
            style={[
              styles.actionButtonSmall,
              recordings.length >= MAX_RECORDINGS && styles.disabledButton,
            ]}
            onPress={handleStartRecording}
            disabled={recordings.length >= MAX_RECORDINGS}
            activeOpacity={0.8}
          >
            <Mic size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButtonSmall,
              recordings.length >= MAX_RECORDINGS && styles.disabledButton,
            ]}
            onPress={voicesActions.pickAudio}
            disabled={recordings.length >= MAX_RECORDINGS}
            activeOpacity={0.8}
          >
            <Upload size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.formatsLabel}>
          Formats acceptés : {ACCEPTED_FORMATS_LABEL}
        </Text>
      </View>

      {/* ✅ Bouton soumettre */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!name.trim() || recordings.length === 0) && styles.disabledButton,
        ]}
        onPress={voicesActions.handleSubmit}
        disabled={!name.trim() || recordings.length === 0 || isSubmitting}
        activeOpacity={0.8}
      >
        <Send size={20} color={COLORS.text.primary} />
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Envoi...' : 'Soumettre'}
        </Text>
      </TouchableOpacity>

      {/* ✅ Feedback erreur */}
      {error && (
        <View style={styles.feedbackCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Espace pour éviter que le bouton soit collé en bas */}
      <View style={{ height: 40 }} />

      {/* ✅ Recording Modal/Overlay */}
      <VoiceRecordingModalV2
        visible={showRecorder}
        onRequestClose={handleCancelRecording}
        voiceRecording={voiceRecording}
        voicesActions={voicesActions}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ✅ Background
  bg: {
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  scrollContent: {
    alignItems: 'stretch',
    paddingTop: 16,
    paddingBottom: 32,
  },
  
  // ✅ Cards avec design système cohérent
  card: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a (plus cohérent que #18181b)
    borderRadius: 16, // Plus moderne (18 → 16)
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.1)
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  cardActions: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // ✅ Typography cohérente
  label: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  // ✅ Input avec design système
  input: {
    backgroundColor: COLORS.background.tertiary, // #2a2a2a
    borderRadius: 12, // Plus moderne
    padding: 12,
    color: COLORS.text.primary,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // Plus cohérent que #23232a
  },
  
  sectionLabel: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  
  // ✅ Instructions avec couleur cohérente
  instructionText: {
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 2,
    lineHeight: 20, // Meilleure lisibilité
  },
  
  // ✅ Recording mini card
  recordingMiniCard: {
    backgroundColor: COLORS.background.tertiary, // #2a2a2a (plus cohérent que #23232a)
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  recordingName: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 15,
    flex: 1,
  },
  
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // ✅ Round buttons avec Rouge Editia
  roundButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 50,
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // ✅ Delete button avec couleur d'erreur
  deleteButton: {
    backgroundColor: COLORS.status.error, // #FF3B30 (système)
    shadowColor: COLORS.status.error,
  },
  
  // ✅ Empty text
  emptyText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  
  // ✅ Action row
  actionRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 8,
  },
  
  // ✅ Action buttons avec Rouge Editia
  actionButtonSmall: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 32,
    padding: 18,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  actionButtonLarge: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // ✅ Submit button avec Vert Editia (succès)
  submitButton: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    shadowColor: COLORS.status.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonText: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ✅ Formats label
  formatsLabel: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 13,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'flex-start',
    lineHeight: 18,
  },
  
  // ✅ Feedback card
  feedbackCard: {
    backgroundColor: COLORS.background.tertiary, // #2a2a2a
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.status.error, // rgba(255, 59, 48, 0.3)
    shadowColor: COLORS.status.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  successText: {
    color: COLORS.status.success, // #00FF88
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // ✅ Modal overlay
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.overlayStrong, // rgba(0, 0, 0, 0.8)
  },
  
  recorderModal: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16, // Plus cohérent
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  
  timerText: {
    color: COLORS.text.primary, // #FFFFFF
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

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE RECORDING UI:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour tous les boutons primaires
 * • #10b981 (vert) → #00FF88 (Vert Editia) pour bouton submit
 * • #ef4444 (rouge) → #FF3B30 (Rouge système) pour delete et errors
 * • #18181b → #1a1a1a (Background secondary cohérent)
 * • #23232a → #2a2a2a (Background tertiary cohérent)
 * • #888 → #B0B0B0 (Text tertiary plus lisible)
 * • #666 → #808080 (Text disabled cohérent)
 * • #fff → #FFFFFF (Text primary via COLORS)
 * 
 * 🎯 AMÉLIORATIONS INTERFACE:
 * • Shadows colorées sur tous les boutons (primary, error, success)
 * • Borders cohérentes avec système de couleurs
 * • Line heights améliorées pour lisibilité
 * • BorderRadius harmonisés (12px, 16px, 32px)
 * • ActiveOpacity sur tous les TouchableOpacity
 * • States disabled avec shadows supprimées
 * 
 * 🚀 NOUVEAUTÉS:
 * • Submit button en Vert Editia avec shadow success
 * • Delete actions en rouge système cohérent
 * • Input avec background tertiary et border système
 * • Cards avec borders subtiles et shadows neutres
 * • Modal avec overlay forte et shadows profondes
 * 
 * 35+ couleurs hardcodées → Interface Voice Recording cohérente Editia ✨
 */