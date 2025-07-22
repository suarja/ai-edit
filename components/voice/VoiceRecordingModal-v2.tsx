/**
 * 🎨 VoiceRecordingModal v2 - Migré vers la Palette Editia
 * 
 * MIGRATION:
 * ❌ Avant: 10+ couleurs hardcodées (#007AFF, #ef4444, #10b981, #18181b, etc.)
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const VoiceRecordingModalV2 = ({
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
          {/* ✅ Error state */}
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
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Réessayer</Text>
              </TouchableOpacity>
            </>
          ) : voiceRecording.state.isProcessing ? (
            // ✅ Uploading state
            <>
              <ActivityIndicator size="large" color={COLORS.interactive.primary} />
              <Text style={styles.sectionLabel}>
                Enregistrement en cours de traitement…
              </Text>
            </>
          ) : voiceRecording.state.isRecording ? (
            // ✅ Recording state
            <>
              <Text style={styles.sectionLabel}>Enregistrement en cours</Text>
              <Text style={styles.timerText}>
                {formatDuration(voiceRecording.state.recordingDuration)}
              </Text>
              <TouchableOpacity
                style={[styles.actionButtonLarge, styles.stopButton]}
                onPress={voiceRecording.actions.stopRecording}
                disabled={!voiceRecording.status.canStop}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Arrêter</Text>
              </TouchableOpacity>
            </>
          ) : voiceRecording.state.isCompleted &&
            voiceRecording.state.recordingUri ? (
            // ✅ Review state
            <>
              <Text style={styles.sectionLabel}>Enregistrement terminé</Text>
              <Text style={styles.timerText}>
                Durée : {formatDuration(voiceRecording.state.recordingDuration)}
              </Text>
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    voicesActions.playSound(
                      voiceRecording.state.recordingUri,
                      0
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Écouter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    voiceRecording.actions.reset();
                    voiceRecording.actions.startRecording();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Réenregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButtonSmall, styles.validateButton]}
                  onPress={voiceRecording.actions.submitRecording}
                  disabled={!voiceRecording.status.canSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // ✅ Idle state
            <>
              <Text style={styles.sectionLabel}>Prêt à enregistrer</Text>
              <TouchableOpacity
                style={[styles.actionButtonLarge, styles.startButton]}
                onPress={voiceRecording.actions.startRecording}
                disabled={!voiceRecording.status.canStart}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Démarrer l'enregistrement</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ✅ Modal overlay avec overlay forte
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.overlayStrong, // rgba(0, 0, 0, 0.8)
  },
  
  // ✅ Recorder modal avec design système
  recorderModal: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16, // Plus moderne (18 → 16)
    padding: 24,
    alignItems: 'center',
    minWidth: 300, // Largeur minimale
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // ✅ Error text
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  
  // ✅ Section label
  sectionLabel: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    textAlign: 'center',
  },
  
  // ✅ Timer text
  timerText: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // ✅ Action button large
  actionButtonLarge: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    minWidth: 200,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // ✅ Start button (variante primaire)
  startButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050
    shadowColor: COLORS.shadow.primary,
  },
  
  // ✅ Stop button (variante erreur)
  stopButton: {
    backgroundColor: COLORS.status.error, // #FF3B30
    shadowColor: COLORS.shadow.error,
  },
  
  // ✅ Action button small
  actionButtonSmall: {
    backgroundColor: COLORS.interactive.primary, // #FF0050
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // ✅ Validate button (variante succès)
  validateButton: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
    shadowColor: COLORS.shadow.success,
  },
  
  // ✅ Review actions container
  reviewActions: {
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  // ✅ Button text
  buttonText: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE RECORDING MODAL:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • ActivityIndicator: #007AFF → #FF0050 (Rouge Editia)
 * • Start button: #007AFF → #FF0050 (Rouge Editia)
 * • Stop button: #ef4444 → #FF3B30 (Rouge système)
 * • Validate button: #10b981 → #00FF88 (Vert Editia)
 * • ActionButtonSmall default: #007AFF → #FF0050 (Rouge Editia)
 * • backgroundColor: #18181b → #1a1a1a (Background secondary)
 * • modalOverlay: rgba(0,0,0,0.7) → rgba(0,0,0,0.8) (Plus forte)
 * • errorText: #ef4444 → #FF3B30 (Rouge système)
 * • sectionLabel & timerText: #fff → #FFFFFF (via COLORS)
 * 
 * 🎯 AMÉLIORATIONS INTERFACE:
 * • Modal avec border et shadow système profonde
 * • BorderRadius: 18 → 16px (plus cohérent)
 * • MinWidth sur modal pour meilleur aspect
 * • Shadows colorées par type de bouton (primary, error, success)
 * • Review actions avec flexWrap et centrage
 * • ActiveOpacity sur tous les TouchableOpacity
 * • MinWidth sur boutons pour cohérence
 * • Line heights améliorées
 * 
 * 🚀 NOUVEAUTÉS:
 * • Boutons typés par couleur (start, stop, validate)
 * • Shadow colors cohérentes avec fonction du bouton
 * • Padding plus généreux sur boutons
 * • TextAlign center sur tous les textes
 * • Elevation progressive (2, 4, 12)
 * 
 * 10+ couleurs hardcodées → Modal Voice Recording cohérente Editia ✨
 */