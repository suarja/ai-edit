import React from 'react';
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
  Volume2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { VoiceRecordingUI } from '@/components/voice/VoiceRecordingUI';

import { ProFeatureLock } from '@/components/guards/ProFeatureLock';
import { useVoices } from '@/components/voice/hooks/useVoices';
import { useRevenueCat } from '@/providers/RevenueCat';

export default function VoiceCloneScreen() {
  const { data, actions } = useVoices();
  const { isPro } = useRevenueCat();

  if (data.isLoading) {
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

  if (!data.isCreating && !data.existingVoice) {
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
              onPress={() => actions.setIsCreating(true)}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.buttonText}>Créer un Clone Vocal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (data.existingVoice && !data.isCreating) {
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
                  {data.existingVoice.status === 'ready' ? 'Prêt' : 'En traitement'}
                </Text>
                <Text style={styles.voiceId}>
                  ID : {data.existingVoice.elevenlabs_voice_id.substring(0, 8)}...
                </Text>
              </View>
            </View>

            {data.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{data.error}</Text>
              </View>
            )}

            <View style={styles.sampleFiles}>
              <View style={styles.sampleHeader}>
                <Text style={styles.sampleTitle}>Échantillons Vocaux</Text>
                {data.loadingSamples && (
                  <ActivityIndicator size="small" color="#007AFF" />
                )}
              </View>

              {data.voiceSamples.length > 0 ? (
                <View style={styles.samplesList}>
                  {data.voiceSamples.map((sample, index) => {
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
                            data.playingIndex === index
                              ? actions.stopSound()
                              : actions.playVoiceSample(sampleId, index)
                          }
                          style={styles.controlButton}
                          disabled={data.loadingSamples || !sampleId}
                        >
                          {data.playingIndex === index ? (
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
                    {data.loadingSamples
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
          data.name && data.recordings.length > 0 && !data.recordingMode
            ? {
                icon: <Send size={20} color="#fff" />,
                onPress: actions.handleSubmit,
                disabled: data.isSubmitting,
                loading: data.isSubmitting,
              }
            : undefined
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {data.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{data.error}</Text>
            </View>
          )}

          {data.isSubmitting && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.progressText}>
                Création du clone vocal en cours...
              </Text>
            </View>
          )}

          {!data.recordingMode && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom de la voix</Text>
                <TextInput
                  style={styles.input}
                  value={data.name}
                  onChangeText={actions.setName}
                  placeholder="Entrez le nom de la voix"
                  placeholderTextColor="#666"
                />
              </View>

              {data.recordings.length > 0 && (
                <View style={styles.recordingsContainer}>
                  <Text style={styles.label}>Enregistrements</Text>
                  <View style={styles.recordingsList}>
                    {data.recordings.map((rec, index) => (
                      <View key={rec.uri} style={styles.recordingItem}>
                        <Text style={styles.recordingName}>{rec.name}</Text>
                        <View style={styles.recordingControls}>
                          <TouchableOpacity
                            onPress={() =>
                              data.playingIndex === index
                                ? actions.stopSound()
                                : actions.playSound(rec.uri, index)
                            }
                            style={styles.controlButton}
                          >
                            {data.playingIndex === index ? (
                              <Square size={20} color="#fff" />
                            ) : (
                              <Play size={20} color="#fff" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => actions.deleteRecording(index)}
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
                  onPress={() => actions.setRecordingMode(true)}
                  style={[
                    styles.button,
                    data.isSubmitting && styles.disabledButton,
                  ]}
                  disabled={data.isSubmitting}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      data.isSubmitting && styles.disabledText,
                    ]}
                  >
                    Enregistrer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={actions.pickAudio}
                  style={[
                    styles.button,
                    data.isSubmitting && styles.disabledButton,
                  ]}
                  disabled={data.isSubmitting}
                >
                  <Upload
                    size={24}
                    color={data.isSubmitting ? '#666' : '#fff'}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      data.isSubmitting && styles.disabledText,
                    ]}
                  >
                    Importer
                  </Text>
                </TouchableOpacity>
              </View>

              {data.recordings.length > 0 && data.name && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={actions.handleSubmit}
                  disabled={data.isSubmitting}
                >
                  {data.isSubmitting ? (
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

          {data.recordingMode && (
            <View style={styles.recordingModeContainer}>
              <VoiceRecordingUI
                variant="settings"
                config={{
                  minDuration: 3000, // 3 seconds
                  maxDuration: 120000, // 2 minutes
                  autoSubmit: false,
                }}
                onComplete={actions.handleRecordingComplete}
                onError={actions.handleRecordingError}
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
                onPress={() => actions.setRecordingMode(false)}
              >
                <Text style={styles.buttonText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

          {data.isCreating && !data.recordingMode && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={actions.handleCancel}
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
