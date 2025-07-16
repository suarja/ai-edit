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
import {
  Upload,
  Play,
  Square,
  Trash,
  Plus,
  Send,
  CircleStop as StopCircle,
  Volume2,
  Crown,
  Zap,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { VoiceRecordingUI } from '@/components/voice/VoiceRecordingUI';
import {
  VoiceRecordingResult,
  VoiceRecordingError,
} from '@/types/voice-recording';
import {
  submitVoiceClone,
  getVoiceSamples,
  getVoiceSampleAudioUrl,
} from '@/lib/api/voice-recording-client';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { ProFeatureLock } from '@/components/guards/ProFeatureLock';

type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
  sample_files: { name: string; uri: string }[];
  created_at: string;
};

type ElevenLabsSample = {
  sampleId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  hash: string;
  durationSecs: number;
};

export default function VoiceCloneScreen() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [existingVoice, setExistingVoice] = useState<VoiceClone | null>(null);
  const [voiceSamples, setVoiceSamples] = useState<ElevenLabsSample[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [name, setName] = useState('');
  const [recordings, setRecordings] = useState<{ uri: string; name: string }[]>(
    []
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recordingMode, setRecordingMode] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();
  const { getToken } = useAuth();
  const { isPro, goPro } = useRevenueCat();

  useEffect(() => {
    fetchExistingVoice();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchExistingVoice = async () => {
    try {
      const user = await fetchUser();
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

      setExistingVoice(voice as unknown as VoiceClone);

      // Si on a une voix, charger ses échantillons depuis ElevenLabs
      if (voice && voice.elevenlabs_voice_id) {
        await loadVoiceSamples(voice.elevenlabs_voice_id as string);
      }
    } catch (err) {
      console.error('Failed to fetch voice:', err);
      setError('Échec du chargement des données vocales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVoiceSamples = async (voiceId: string) => {
    try {
      setLoadingSamples(true);
      console.log(`🔍 Chargement échantillons pour voix: ${voiceId}`);

      const token = await getToken();
      if (!token) {
        router.push('/(auth)/sign-in');
        return;
      }
      const samples = await getVoiceSamples(voiceId, { token });
      console.log(
        `🔍 Debug échantillons reçus:`,
        JSON.stringify(samples, null, 2)
      );
      setVoiceSamples(samples);

      console.log(`✅ ${samples.length} échantillons chargés`);
    } catch (err: any) {
      console.error('Failed to load voice samples:', err);
      setError('Échec du chargement des échantillons vocaux');
    } finally {
      setLoadingSamples(false);
    }
  };

  const playVoiceSample = async (sampleId: string, index: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (!existingVoice) return;

      console.log(`🔊 Lecture échantillon: ${sampleId}`);
      const token = await getToken();
      if (!token) {
        router.push('/(auth)/sign-in');
        return;
      }
      // Obtenir l'URL de l'échantillon depuis notre serveur
      const audioUrl = await getVoiceSampleAudioUrl(
        existingVoice.elevenlabs_voice_id,
        sampleId,
        { token }
      );

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
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
      console.error('Failed to play voice sample', err);
      setPlayingIndex(null);
      setError("Échec de la lecture de l'échantillon vocal");
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
      } catch (err) {
        console.log('Stop failed, continuing with unload:', err);
      }

      try {
        await sound.unloadAsync();
      } catch (err) {
        console.log('Unload failed:', err);
      }

      // Always reset state even if stop/unload failed
      setSound(null);
      setPlayingIndex(null);
      setError(null);
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

  const handleRecordingComplete = async (result: VoiceRecordingResult) => {
    // Protection contre les soumissions multiples
    if (isSubmitting) {
      console.log('⚠️ Soumission déjà en cours, ignorer');
      return;
    }

    try {
      const recordingName = `Enregistrement ${recordings.length + 1}.m4a`;
      const newRecording = { uri: result.uri, name: recordingName };
      const user = await fetchUser();
      const token = await getToken();
      if (!token || !user) {
        router.push('/(auth)/sign-in');
        return;
      }

      // Si on a un nom, soumettre directement
      if (name.trim()) {
        setIsSubmitting(true);
        await submitVoiceClone({
          name: name.trim(),
          recordings: [...recordings, newRecording],
          token,
          user,
        });

        // Succès - nettoyer et revenir à la liste
        setName('');
        setRecordings([]);
        setError(null);
        setIsCreating(false);
        setRecordingMode(false);
        await fetchExistingVoice();
      } else {
        // Pas de nom - juste ajouter à la liste
        setRecordings((prev) => [...prev, newRecording]);
        setRecordingMode(false);
      }
    } catch (err: any) {
      console.error('Error handling recording:', err);
      setError(err?.message || "Échec de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordingError = (error: VoiceRecordingError) => {
    console.error('Recording error:', error);
    setError(error.message);
  };

  const handleSubmit = async () => {
    // Protection contre les soumissions multiples
    if (!name || recordings.length === 0 || isSubmitting) {
      console.log('⚠️ Conditions non remplies ou soumission en cours');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const user = await fetchUser();
      const token = await getToken();
      if (!token || !user) {
        router.push('/(auth)/sign-in');
        return;
      }
      await submitVoiceClone({
        name: name,
        recordings: recordings.map((r) => ({
          uri: r.uri,
          name: r.name,
        })),
        user: user,
        token: token,
      });

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
    setRecordingMode(false);
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

  // Show paywall for non-pro users
  if (!isPro) {
    return (
      <ProFeatureLock
        featureTitle="Clone Vocal"
        featureDescription="Créez votre premier clone vocal pour commencer"
      />
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
        <ScrollView style={styles.scrollView}>
          <View style={styles.voiceContainer}>
            <View style={styles.voiceHeader}>
              <View style={styles.voiceHeaderIcon}>
                <Volume2 size={32} color="#10b981" />
              </View>
              <View style={styles.voiceInfo}>
                <Text style={styles.voiceName}>Clone Vocal Actif</Text>
                <Text style={styles.voiceStatus}>
                  Statut :{' '}
                  {existingVoice.status === 'ready' ? 'Prêt' : 'En traitement'}
                </Text>
                <Text style={styles.voiceId}>
                  ID : {existingVoice.elevenlabs_voice_id.substring(0, 8)}...
                </Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.sampleFiles}>
              <View style={styles.sampleHeader}>
                <Text style={styles.sampleTitle}>Échantillons Vocaux</Text>
                {loadingSamples && (
                  <ActivityIndicator size="small" color="#007AFF" />
                )}
              </View>

              {voiceSamples.length > 0 ? (
                <View style={styles.samplesList}>
                  {voiceSamples.map((sample, index) => {
                    const sampleId = sample.sampleId;
                    const fileName =
                      sample.fileName || `Échantillon ${index + 1}`;
                    const fileSize = sample.sizeBytes;

                    return (
                      <View key={sampleId} style={styles.sampleItem}>
                        <View style={styles.sampleInfo}>
                          <Text style={styles.sampleName}>{fileName}</Text>
                          <Text style={styles.sampleSize}>
                            {(fileSize / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            playingIndex === index
                              ? stopSound()
                              : playVoiceSample(sampleId, index)
                          }
                          style={styles.controlButton}
                          disabled={loadingSamples || !sampleId}
                        >
                          {playingIndex === index ? (
                            <Square size={20} color="#fff" />
                          ) : (
                            <Play size={20} color="#fff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noSamplesContainer}>
                  <Text style={styles.noSamplesText}>
                    {loadingSamples
                      ? 'Chargement des échantillons...'
                      : 'Aucun échantillon disponible'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader
        title="Créer un Clone Vocal"
        rightButton={
          name && recordings.length > 0 && !recordingMode
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

          {isSubmitting && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.progressText}>
                Création du clone vocal en cours...
              </Text>
            </View>
          )}

          {!recordingMode && (
            <>
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

              {recordings.length > 0 && (
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
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => setRecordingMode(true)}
                  style={[styles.button, isSubmitting && styles.disabledButton]}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isSubmitting && styles.disabledText,
                    ]}
                  >
                    Enregistrer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickAudio}
                  style={[styles.button, isSubmitting && styles.disabledButton]}
                  disabled={isSubmitting}
                >
                  <Upload size={24} color={isSubmitting ? '#666' : '#fff'} />
                  <Text
                    style={[
                      styles.buttonText,
                      isSubmitting && styles.disabledText,
                    ]}
                  >
                    Importer
                  </Text>
                </TouchableOpacity>
              </View>

              {recordings.length > 0 && name && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Send size={20} color="#fff" />
                      <Text style={styles.buttonText}>Soumettre</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {recordingMode && (
            <View style={styles.recordingModeContainer}>
              <VoiceRecordingUI
                variant="settings"
                config={{
                  minDuration: 3000, // 3 seconds
                  maxDuration: 120000, // 2 minutes
                  autoSubmit: false,
                }}
                onComplete={handleRecordingComplete}
                onError={handleRecordingError}
                customInstructions={[
                  'Parlez clairement dans le microphone',
                  'Enregistrez pendant au moins 3 secondes',
                  'Variez votre intonation pour de meilleurs résultats',
                ]}
                showInstructions={true}
                showTimer={true}
              />

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setRecordingMode(false)}
              >
                <Text style={styles.buttonText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

          {isCreating && !recordingMode && (
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
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  recordingModeContainer: {
    gap: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  progressText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  voiceHeaderIcon: {
    marginRight: 16,
  },
  voiceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  samplesList: {
    gap: 8,
  },
  sampleItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sampleInfo: {
    flex: 1,
    marginRight: 12,
  },
  sampleName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sampleSize: {
    color: '#888',
    fontSize: 12,
  },
  noSamplesContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noSamplesText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  paywallContainer: {
    padding: 20,
  },
  paywallHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  paywallDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  paywallFooter: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
