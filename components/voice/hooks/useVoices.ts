import React, { useState, useEffect } from 'react';

import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

import {
  VoiceRecordingResult,
  VoiceRecordingError,
  VoiceClone,
  ElevenLabsSample,
} from '@/lib/types/voice-recording';
import {
  submitVoiceClone,
  getVoiceSamples,
  getVoiceSampleAudioUrl,
} from '@/components/voice/voice-recording-client';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useGetUser } from '@/components/hooks/useGetUser';

export type UseVoicesReturn = {
  data: {
    isCreating: boolean;
    existingVoice: VoiceClone | null;
    voiceSamples: ElevenLabsSample[];
    loadingSamples: boolean;
    name: string;
    recordings: { uri: string; name: string }[];
    sound: Audio.Sound | null;
    playingIndex: number | null;
    isSubmitting: boolean;
    error: string | null;
    isLoading: boolean;
    recordingMode: boolean;
  };
  actions: {
    pickAudio: () => Promise<void>;
    deleteRecording: (index: number) => Promise<void>;
    handleRecordingComplete: (result: VoiceRecordingResult) => Promise<void>;
    handleRecordingError: (error: VoiceRecordingError) => void;
    handleSubmit: () => Promise<void>;
    handleCancel: () => void;
    loadVoiceSamples: (voiceId: string) => Promise<void>;
    playVoiceSample: (sampleId: string, index: number) => Promise<void>;
    playSound: (uri: string, index: number) => Promise<void>;
    stopSound: () => Promise<void>;
    fetchExistingVoice: () => Promise<void>;
    setIsCreating: (isCreating: boolean) => void;
    setName: (name: string) => void;
    setRecordingMode: (recordingMode: boolean) => void;
  };
};
export const useVoices = (): UseVoicesReturn => {
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

  const { fetchUser } = useGetUser();
  const { getToken } = useAuth();

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

      // const { data: voice, error: fetchError } = await supabase
      //   .from('voice_clones')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single();

      // if (fetchError && fetchError.code !== 'PGRST116') {
      //   throw fetchError;
      // }

      // setExistingVoice(voice as unknown as VoiceClone);
      setExistingVoice(null);

      // Si on a une voix, charger ses échantillons depuis ElevenLabs
      // if (voice && voice.elevenlabs_voice_id) {
      //   await loadVoiceSamples(voice.elevenlabs_voice_id as string);
      // }
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

  return {
    data: {
      isCreating,
      existingVoice,
      voiceSamples,
      loadingSamples,
      name,
      recordings,
      sound,
      playingIndex,
      isSubmitting,
      error,
      isLoading,
      recordingMode,
    },
    actions: {
      pickAudio,
      deleteRecording,
      handleRecordingComplete,
      handleRecordingError,
      handleSubmit,
      handleCancel,
      loadVoiceSamples,
      playVoiceSample,
      playSound,
      stopSound,
      fetchExistingVoice,
      setIsCreating,
      setName,
      setRecordingMode,
    },
  };
};
