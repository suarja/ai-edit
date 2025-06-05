import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  Mic,
  Upload,
  Play,
  Square,
  Trash,
  Send,
  Plus,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { env } from '@/lib/config/env';

type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
  sample_files: { name: string; uri: string }[];
  created_at: string;
};

export default function VoiceCloneScreen() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [existingVoice, setExistingVoice] = useState<VoiceClone | null>(null);
  const [name, setName] = useState('');
  const [recordings, setRecordings] = useState<{ uri: string; name: string }[]>(
    []
  );
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExistingVoice();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    })();
  }, []);

  const fetchExistingVoice = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const { data: voice, error: fetchError } = await supabase
        .from('voice_clones')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setExistingVoice(voice);
    } catch (err) {
      console.error('Failed to fetch voice:', err);
      setError('Échec du chargement des données vocales');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError("Échec du démarrage de l'enregistrement");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        const recordingName = `Enregistrement ${recordings.length + 1}.m4a`;
        setRecordings((prev) => [...prev, { uri, name: recordingName }]);
      }
      setRecording(null);
      setIsRecording(false);
      setError(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError("Échec de l'arrêt de l'enregistrement");
    }
  };

  const playSound = async (uri: string, index: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setPlayingIndex(null);
          }
        }
      );

      setSound(newSound);
      setPlayingIndex(index);
      setError(null);
    } catch (err) {
      console.error('Failed to play sound', err);
      setPlayingIndex(null);
      setError('Échec de la lecture');
    }
  };

  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingIndex(null);
        setError(null);
      } catch (err) {
        console.error('Failed to stop sound', err);
        setError("Échec de l'arrêt de la lecture");
      }
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setRecordings((prev) => [
          ...prev,
          { uri: asset.uri, name: asset.name },
        ]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to pick audio', err);
      setError('Échec de la sélection du fichier audio');
    }
  };

  const deleteRecording = async (index: number) => {
    try {
      if (playingIndex === index && sound) {
        await sound.unloadAsync();
        setPlayingIndex(null);
      }
      setRecordings((prev) => prev.filter((_, i) => i !== index));
      setError(null);
    } catch (err) {
      console.error('Failed to delete recording', err);
      setError("Échec de la suppression de l'enregistrement");
    }
  };

  const handleSubmit = async () => {
    if (!name || recordings.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const response = await fetch(
        `${env.SUPABASE_URL}/functions/v1/create-voice-clone`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            recordings: recordings.map((r) => ({
              uri: r.uri,
              name: r.name,
            })),
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la création du clone vocal');
      }

      setName('');
      setRecordings([]);
      setError(null);
      setIsCreating(false);
      await fetchExistingVoice();
    } catch (err) {
      console.error('Failed to submit voice clone:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Échec de la création du clone vocal'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setName('');
    setRecordings([]);
    setError(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Clone Vocal" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isCreating && !existingVoice) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Clone Vocal" />
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun clone vocal trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
              Créez votre premier clone vocal pour commencer
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setIsCreating(true)}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.buttonText}>Créer un Clone Vocal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (existingVoice && !isCreating) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Votre Clone Vocal" />
        <View style={styles.voiceContainer}>
          <View style={styles.voiceHeader}>
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceId}>
                ID de voix : {existingVoice.elevenlabs_voice_id}
              </Text>
              <Text style={styles.voiceStatus}>
                Statut : {existingVoice.status}
              </Text>
            </View>
          </View>
          <View style={styles.sampleFiles}>
            <Text style={styles.sampleTitle}>Enregistrements</Text>
            {existingVoice.sample_files.map((file, index) => (
              <View key={index} style={styles.recordingItem}>
                <Text style={styles.recordingName}>{file.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    playingIndex === index
                      ? stopSound()
                      : playSound(file.uri, index)
                  }
                  style={styles.controlButton}
                >
                  {playingIndex === index ? (
                    <Square size={20} color="#fff" />
                  ) : (
                    <Play size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader
        title="Créer un Clone Vocal"
        rightButton={
          name && recordings.length > 0
            ? {
                icon: <Send size={20} color="#fff" />,
                onPress: handleSubmit,
                disabled: isSubmitting,
                loading: isSubmitting,
              }
            : undefined
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom de la voix</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Entrez le nom de la voix"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.recordingsContainer}>
            <Text style={styles.label}>Enregistrements</Text>
            <View style={styles.recordingsList}>
              {recordings.map((rec, index) => (
                <View key={rec.uri} style={styles.recordingItem}>
                  <Text style={styles.recordingName}>{rec.name}</Text>
                  <View style={styles.recordingControls}>
                    <TouchableOpacity
                      onPress={() =>
                        playingIndex === index
                          ? stopSound()
                          : playSound(rec.uri, index)
                      }
                      style={styles.controlButton}
                    >
                      {playingIndex === index ? (
                        <Square size={20} color="#fff" />
                      ) : (
                        <Play size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteRecording(index)}
                      style={[styles.controlButton, styles.deleteButton]}
                    >
                      <Trash size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[styles.button, isRecording && styles.recordingButton]}
            >
              <Mic size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {isRecording ? 'Arrêter' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickAudio} style={styles.button}>
              <Upload size={24} color="#fff" />
              <Text style={styles.buttonText}>Importer</Text>
            </TouchableOpacity>
          </View>

          {isCreating && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  voiceContainer: {
    margin: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  voiceHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  voiceInfo: {
    gap: 8,
  },
  voiceId: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  voiceStatus: {
    color: '#10b981',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  sampleFiles: {
    padding: 20,
    gap: 12,
  },
  sampleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    gap: 24,
  },
  errorContainer: {
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  recordingsContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  recordingsList: {
    gap: 8,
  },
  recordingItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  recordingButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#333',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
});
