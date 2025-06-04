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
import {
  Send,
  CircleAlert as AlertCircle,
  Sparkles,
  Settings,
  Wand2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoType, CaptionConfiguration } from '@/types/video';
import VideoSelectionCarousel from '@/components/VideoSelectionCarousel';
import VoiceCloneSection from '@/components/VoiceCloneSection';
import EditorialProfileSection from '@/components/EditorialProfileSection';
import VideoSettingsSection from '@/components/VideoSettingsSection';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';

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

// Default caption configuration
const DEFAULT_CAPTION_CONFIG: CaptionConfiguration = {
  presetId: 'karaoke',
  placement: 'bottom',
  lines: 3,
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
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [sourceVideos, setSourceVideos] = useState<VideoType[]>([]);
  const [voiceClone, setVoiceClone] = useState<VoiceClone | null>(null);
  const [editorialProfile, setEditorialProfile] =
    useState<EditorialProfile | null>(null);
  const [useEditorialProfile, setUseEditorialProfile] = useState(true);
  const [customEditorialProfile, setCustomEditorialProfile] =
    useState<CustomEditorialProfile>(DEFAULT_EDITORIAL_PROFILE);
  const [captionConfig, setCaptionConfig] = useState<CaptionConfiguration>(
    DEFAULT_CAPTION_CONFIG
  );

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

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      Alert.alert(
        'Description manquante',
        'Veuillez entrer une description à améliorer.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setEnhancing(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enhance prompt');
      }

      // Update the prompt with the enhanced version
      setPrompt(result.data.enhanced);
    } catch (err) {
      console.error('Error enhancing prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
    } finally {
      setEnhancing(false);
    }
  };

  const validateRequest = () => {
    if (!prompt.trim()) {
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

    if (
      !useEditorialProfile &&
      !customEditorialProfile.persona_description.trim()
    ) {
      Alert.alert(
        'Détails éditoriaux manquants',
        'Pour un contenu plus authentique et personnalisé, veuillez fournir des détails sur votre style de contenu.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!captionConfig.presetId) {
      Alert.alert(
        'Style de sous-titres manquant',
        'Veuillez sélectionner un style de sous-titres pour votre vidéo.',
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

      // Prepare editorial profile data
      const profileData = useEditorialProfile
        ? editorialProfile || DEFAULT_EDITORIAL_PROFILE
        : customEditorialProfile;

      const requestPayload = {
        prompt: prompt.trim(),
        systemPrompt: systemPrompt.trim(),
        selectedVideos: selectedVideoData,
        voiceId: voiceClone?.elevenlabs_voice_id || DEFAULT_VOICE_ID,
        editorialProfile: profileData,
        captionConfig: captionConfig,
      };

      // console.log('Submitting video generation request:', requestPayload);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Auth token:', session?.access_token);
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
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
            onPress: () => router.push('/(tabs)/videos'),
          },
        ]
      );

      // Reset form
      setPrompt('');
      setSystemPrompt('');
      setSelectedVideos([]);
      setShowAdvanced(false);
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
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Créer une Vidéo</Text>
            <Text style={styles.subtitle}>
              Générez du contenu à partir de vos vidéos
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Sparkles size={24} color="#007AFF" />
          </View>
        </View>
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
          <Text style={styles.sectionDescription}>
            Décrivez le type de contenu que vous souhaitez créer
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.promptInput}
              multiline
              numberOfLines={6}
              placeholder="Ex: Créez une vidéo explicative sur les meilleures pratiques de productivité, en utilisant un ton professionnel mais accessible..."
              placeholderTextColor="#666"
              value={prompt}
              onChangeText={setPrompt}
              maxLength={1000}
            />
            <TouchableOpacity
              style={styles.enhanceButton}
              onPress={enhancePrompt}
              disabled={enhancing || !prompt.trim()}
            >
              {enhancing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Wand2 size={18} color="#fff" />
              )}
              <Text style={styles.enhanceButtonText}>
                {enhancing ? 'Amélioration...' : 'Améliorer'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{prompt.length}/1000</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings size={16} color="#007AFF" />
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions Système</Text>
            <Text style={styles.sectionDescription}>
              Instructions techniques spécifiques pour l'IA (optionnel)
            </Text>
            <TextInput
              style={styles.systemPromptInput}
              multiline
              numberOfLines={4}
              placeholder="Ex: Utilisez un style narratif, incluez des transitions fluides, mettez l'accent sur les points clés..."
              placeholderTextColor="#666"
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              maxLength={500}
            />
            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{systemPrompt.length}/500</Text>
            </View>
          </View>
        )}

        <VideoSettingsSection
          captionConfig={captionConfig}
          onCaptionConfigChange={setCaptionConfig}
        />

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
            (submitting || !prompt.trim() || selectedVideos.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || !prompt.trim() || selectedVideos.length === 0}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>
                Génération en cours...
              </Text>
            </>
          ) : (
            <>
              <Send size={20} color="#fff" />
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
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
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#888',
    marginBottom: 16,
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
  },
  promptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#333',
    paddingBottom: 60, // Extra space for the enhance button
  },
  enhanceButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#7958FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7958FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  systemPromptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  charCount: {
    color: '#888',
    fontSize: 12,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
  },
  advancedToggleText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
