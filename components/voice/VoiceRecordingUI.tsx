import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Play, Trash, Upload, Mic, Send } from 'lucide-react-native';
import { useVoiceRecording } from '@/components/hooks/useVoiceRecording';
import { useVoices } from './hooks/useVoices';

const ACCEPTED_FORMATS = [
  'aac',
  'aiff',
  'ogg',
  'mp3',
  'opus',
  'wav',
  'flac',
  'm4a',
  'webm',
];
const ACCEPTED_FORMATS_LABEL =
  'AAC, AIFF, OGG, MP3, OPUS, WAV, FLAC, M4A, WEBM';
const MAX_RECORDINGS = 3;

const RECORDING_INSTRUCTIONS = [
  'Parlez clairement dans le microphone',
  'Évitez le bruit de fond et les interruptions',
  '1 à 2 minutes recommandé, 3 max',
  'Format : mono, pas de musique, pas d’effets',
];

export const VoiceRecordingUI: React.FC = () => {
  const { data: voicesData, actions: voicesActions } = useVoices();
  const voiceRecording = useVoiceRecording();
  const [name, setName] = useState('');
  const [recordings, setRecordings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Ajout d'un enregistrement (depuis enregistrement ou import)
  const handleAddRecording = (rec: any) => {
    if (recordings.length >= MAX_RECORDINGS) {
      setError('Vous ne pouvez ajouter que 3 enregistrements.');
      return;
    }
    setRecordings((prev) => [...prev, rec]);
    setError(null);
  };

  // Suppression d'un enregistrement
  const handleDeleteRecording = (index: number) => {
    setRecordings((prev) => prev.filter((_, i) => i !== index));
  };

  // Import d'un fichier audio
  const handleImport = async () => {
    if (recordings.length >= MAX_RECORDINGS) {
      setError('Vous ne pouvez ajouter que 3 enregistrements.');
      return;
    }
    // Simuler un import (à remplacer par la vraie logique d'import)
    const fakeFile = {
      name: `imported_${Date.now()}.mp3`,
      uri: 'fakeuri',
      format: 'mp3',
    };
    if (!ACCEPTED_FORMATS.includes(fakeFile.format)) {
      setError('Format non supporté.');
      return;
    }
    handleAddRecording(fakeFile);
  };

  // Enregistrement audio (à brancher sur useVoiceRecording)
  const handleRecord = async () => {
    if (recordings.length >= MAX_RECORDINGS) {
      setError('Vous ne pouvez ajouter que 3 enregistrements.');
      return;
    }
    // Simuler un enregistrement
    const fakeRec = {
      name: `recording_${Date.now()}.wav`,
      uri: 'fakeuri',
      format: 'wav',
    };
    handleAddRecording(fakeRec);
  };

  // Lecture d'un enregistrement (à brancher sur useVoiceRecording)
  const handlePlay = (rec: any) => {
    // TODO: brancher la lecture réelle
    Alert.alert('Lecture', `Lecture de ${rec.name}`);
  };

  // Soumission de la voix
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Le nom de la voix est obligatoire.');
      return;
    }
    if (recordings.length === 0) {
      setError('Ajoutez au moins un enregistrement.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    // TODO: synchroniser avec useVoices et VoiceConfigStorage
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess('Voix enregistrée et sélectionnée.');
      // TODO: retour à la liste (à gérer dans le parent)
    }, 1000);
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
          onChangeText={setName}
          placeholder="Entrez le nom de la voix"
          placeholderTextColor="#666"
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
                  onPress={() => handlePlay(item)}
                  style={styles.roundButton}
                >
                  <Play size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteRecording(index)}
                  style={[styles.roundButton, styles.deleteButton]}
                >
                  <Trash size={18} color="#fff" />
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
            onPress={handleRecord}
            disabled={recordings.length >= MAX_RECORDINGS}
          >
            <Mic size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButtonSmall,
              recordings.length >= MAX_RECORDINGS && styles.disabledButton,
            ]}
            onPress={handleImport}
            disabled={recordings.length >= MAX_RECORDINGS}
          >
            <Upload size={20} color="#fff" />
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
        onPress={handleSubmit}
        disabled={!name.trim() || recordings.length === 0 || isSubmitting}
      >
        <Send size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Envoi...' : 'Soumettre'}
        </Text>
      </TouchableOpacity>

      {/* Feedback erreur/succès */}
      {error && (
        <View style={styles.feedbackCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={styles.feedbackCard}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Espace pour éviter que le bouton soit collé en bas */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#000',
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActions: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#23232a',
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  instructionText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 2,
  },
  recordingMiniCard: {
    backgroundColor: '#23232a',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingName: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roundButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  emptyText: {
    color: '#888',
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
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formatsLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
  feedbackCard: {
    backgroundColor: '#23232a',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
});
