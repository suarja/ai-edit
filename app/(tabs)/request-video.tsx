import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Send, CircleAlert as AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoType } from '@/types/video';
import VideoSelectionCarousel from '@/components/VideoSelectionCarousel';
import VoiceCloneSection from '@/components/VoiceCloneSection';
import EditorialProfileSection from '@/components/EditorialProfileSection';

// Default voice ID to use when no voice clone exists
const DEFAULT_VOICE_ID = 'NFcw9p0jKu3zbmXieNPE';

// Default editorial profile for when none exists
const DEFAULT_EDITORIAL_PROFILE = {
  persona_description:
    'Créateur de contenu professionnel axé sur une communication claire et engageante',
  tone_of_voice: 'Conversationnel et amical, tout en restant professionnel',
  audience: "Professionnels passionnés par la productivité et l'innovation",
  style_notes:
    'Explications claires avec des exemples pratiques, maintenant un équilibre entre informatif et engageant',
};

type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
};

type EditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
};

type CustomEditorialProfile = {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

export default function RequestVideoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [sourceVideos, setSourceVideos] = useState<VideoType[]>([]);
  const [voiceClone, setVoiceClone] = useState<VoiceClone | null>(null);
  const [editorialProfile, setEditorialProfile] =
    useState<EditorialProfile | null>(null);
  const [useEditorialProfile, setUseEditorialProfile] = useState(true);
  const [customEditorialProfile, setCustomEditorialProfile] =
    useState<CustomEditorialProfile>(DEFAULT_EDITORIAL_PROFILE);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data...');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Fetch source videos
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;
      setSourceVideos(videos || []);
      console.log('Fetched videos:', videos?.length || 0);

      // Fetch voice clone
      const { data: voice, error: voiceError } = await supabase
        .from('voice_clones')
        .select('id, elevenlabs_voice_id, status')
        .eq('user_id', user.id)
        .single();

      if (voiceError && voiceError.code !== 'PGRST116') throw voiceError;
      setVoiceClone(voice);
      console.log('Voice clone status:', voice?.status || 'none');

      // Fetch editorial profile
      const { data: profile, error: profileError } = await supabase
        .from('editorial_profiles')
        .select('id, persona_description, tone_of_voice, audience, style_notes')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setEditorialProfile(profile);
      console.log('Editorial profile found:', !!profile);

      // If we have an editorial profile, use it as the base for custom profile
      if (profile) {
        setCustomEditorialProfile({
          persona_description:
            profile.persona_description ||
            DEFAULT_EDITORIAL_PROFILE.persona_description,
          tone_of_voice:
            profile.tone_of_voice || DEFAULT_EDITORIAL_PROFILE.tone_of_voice,
          audience: profile.audience || DEFAULT_EDITORIAL_PROFILE.audience,
          style_notes:
            profile.style_notes || DEFAULT_EDITORIAL_PROFILE.style_notes,
        });
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load required data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const validateRequest = () => {
    if (!prompt) {
      Alert.alert(
        'Description manquante',
        'Veuillez entrer une description de la vidéo que vous souhaitez créer.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (selectedVideos.length === 0) {
      Alert.alert(
        'Aucune vidéo sélectionnée',
        'Veuillez sélectionner au moins une vidéo source.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!useEditorialProfile && !customEditorialProfile.persona_description) {
      Alert.alert(
        'Détails éditoriaux manquants',
        'Pour un contenu plus authentique et personnalisé, veuillez fournir des détails sur votre style de contenu.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateRequest()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('Preparing request payload...');

      // Get storage paths for selected videos
      const selectedVideoData = sourceVideos.filter((video) =>
        selectedVideos.includes(video.id)
      );

      const videoIds = selectedVideoData.map((video) => video.storage_path);

      // Prepare editorial profile data
      const profileData = useEditorialProfile
        ? editorialProfile || DEFAULT_EDITORIAL_PROFILE
        : customEditorialProfile;

      const requestPayload = {
        prompt,
        systemPrompt,
        videoIds,
        voiceId: voiceClone?.elevenlabs_voice_id || DEFAULT_VOICE_ID,
        editorialProfile: profileData,
      };

      console.log('Submitting video generation request:', requestPayload);

      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate video');
      }

      console.log('Video generation started:', result);

      Alert.alert(
        'Génération lancée',
        'Votre vidéo est en cours de génération. Vous recevrez une notification quand elle sera prête.',
        [
          {
            text: 'Voir mes vidéos',
            onPress: () => router.push('/(tabs)/generated-videos'),
          },
        ]
      );

      // Reset form
      setPrompt('');
      setSystemPrompt('');
      setSelectedVideos([]);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Demander une Vidéo</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description de la Vidéo</Text>
          <TextInput
            style={styles.promptInput}
            multiline
            numberOfLines={6}
            placeholder="Décrivez la vidéo que vous souhaitez créer..."
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
          />
          <Text style={styles.charCount}>{prompt.length}/500</Text>
        </View>

        <VideoSelectionCarousel
          videos={sourceVideos}
          selectedVideoIds={selectedVideos}
          onVideoToggle={toggleVideoSelection}
        />

        <VoiceCloneSection voiceClone={voiceClone} />

        <EditorialProfileSection
          editorialProfile={editorialProfile}
          useEditorialProfile={useEditorialProfile}
          customEditorialProfile={customEditorialProfile}
          defaultEditorialProfile={DEFAULT_EDITORIAL_PROFILE}
          onToggleUseProfile={setUseEditorialProfile}
          onUpdateCustomProfile={setCustomEditorialProfile}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !prompt || selectedVideos.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || !prompt || selectedVideos.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Générer la Vidéo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  promptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
