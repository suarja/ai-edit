import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { VideoType, CaptionConfiguration } from '@/types/video';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';
import { API_ENDPOINTS } from '@/lib/config/api';

// Default voice ID
const DEFAULT_VOICE_ID = 'NFcw9p0jKu3zbmXieNPE';

// Default language
const DEFAULT_LANGUAGE = 'fr';

// Default editorial profile
const DEFAULT_EDITORIAL_PROFILE = {
  persona_description:
    'Créateur de contenu professionnel axé sur une communication claire et engageante',
  tone_of_voice: 'Conversationnel et amical, tout en restant professionnel',
  audience: "Professionnels passionnés par la productivité et l'innovation",
  style_notes:
    'Explications claires avec des exemples pratiques, maintenant un équilibre entre informatif et engageant',
};

// Default enhanced caption configuration
const DEFAULT_CAPTION_CONFIG = CaptionConfigStorage.getDefault();

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

export default function useVideoRequest() {
  // Clerk authentication
  const { getToken } = useAuth();
  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  // Add language state with French as default
  const [outputLanguage, setOutputLanguage] =
    useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchInitialData();
    }
  }, [clerkLoaded, isSignedIn]);

  const fetchInitialData = async () => {
    try {

      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Fetch source videos using database ID
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;
      setSourceVideos(videos as unknown as VideoType[]);

      // Fetch voice clone using database ID
      const { data: voice, error: voiceError } = await supabase
        .from('voice_clones')
        .select('id, elevenlabs_voice_id, status')
        .eq('user_id', user.id)
        .single();

      if (voiceError && voiceError.code !== 'PGRST116') throw voiceError;
      setVoiceClone(voice as unknown as VoiceClone);

      // Fetch editorial profile using database ID
      const { data: profile, error: profileError } = await supabase
        .from('editorial_profiles')
        .select('id, persona_description, tone_of_voice, audience, style_notes')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setEditorialProfile(profile as unknown as EditorialProfile);

      // If we have an editorial profile, use it as the base for custom profile
      if (profile) {
        setCustomEditorialProfile({
          persona_description:
            (profile.persona_description as string) ||
            DEFAULT_EDITORIAL_PROFILE.persona_description,
          tone_of_voice:
            (profile.tone_of_voice as string) ||
            DEFAULT_EDITORIAL_PROFILE.tone_of_voice,
          audience:
            (profile.audience as string) || DEFAULT_EDITORIAL_PROFILE.audience,
          style_notes:
            (profile.style_notes as string) ||
            DEFAULT_EDITORIAL_PROFILE.style_notes,
        });
      }

      // Load saved caption configuration using database ID
      try {
        const savedCaptionConfig = await CaptionConfigStorage.getOrDefault(
          user.id
        );
        setCaptionConfig(savedCaptionConfig);
      } catch (error) {
        console.warn('Failed to load saved caption config:', error);
        // Fallback to default if loading fails
        setCaptionConfig(CaptionConfigStorage.getDefault());
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load required data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const validateRequest = () => {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
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

    // Enhanced validation: only check if captions are enabled and missing required fields
    if (
      captionConfig.enabled &&
      (!captionConfig.presetId || !captionConfig.transcriptColor)
    ) {
      Alert.alert(
        'Configuration des sous-titres incomplète',
        'Veuillez configurer complètement vos sous-titres ou les désactiver.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!outputLanguage) {
      Alert.alert(
        'Langue de sortie manquante',
        'Veuillez sélectionner une langue pour votre vidéo.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleReset = () => {
    setPrompt('');
    setSystemPrompt('');
    setSelectedVideos([]);
    setShowAdvanced(false);
    setError(null);
    setUseEditorialProfile(true);
    setCustomEditorialProfile(DEFAULT_EDITORIAL_PROFILE);
    setCaptionConfig(DEFAULT_CAPTION_CONFIG);
    setOutputLanguage(DEFAULT_LANGUAGE);
  };

  const handleSubmit = async () => {
    if (!validateRequest()) return;

    try {
      setSubmitting(true);
      setError(null);

      // Get the database user
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Get latest caption config to ensure we have the most recent settings
      const currentCaptionConfig = await CaptionConfigStorage.getOrDefault(
        user.id
      );

      // Get storage paths for selected videos
      const selectedVideoData = sourceVideos.filter((video) =>
        selectedVideos.includes(video.id)
      );

      // Prepare editorial profile data
      const profileData = useEditorialProfile
        ? editorialProfile || DEFAULT_EDITORIAL_PROFILE
        : customEditorialProfile;

      const requestPayload = {
        prompt: prompt && typeof prompt === 'string' ? prompt.trim() : '',
        systemPrompt:
          systemPrompt && typeof systemPrompt === 'string'
            ? systemPrompt.trim()
            : '',
        selectedVideos: selectedVideoData,
        voiceId: voiceClone?.elevenlabs_voice_id || DEFAULT_VOICE_ID,
        editorialProfile: profileData,
        captionConfig: currentCaptionConfig, // Use fresh config
        outputLanguage: outputLanguage,
      };

      // Get Clerk token for API authentication
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(API_ENDPOINTS.VIDEO_GENERATE(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate video');
      }

      Alert.alert(
        'Génération lancée',
        'Votre vidéo est en cours de génération. Vous recevrez une notification quand elle sera prête.',
        [
          {
            text: 'Voir mes vidéos',
                            onPress: () => router.push('/videos'),
          },
        ]
      );

      // Reset form after successful submission
      handleReset();
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // State
    loading,
    refreshing,
    submitting,
    error,
    prompt,
    systemPrompt,
    showAdvanced,
    selectedVideos,
    sourceVideos,
    voiceClone,
    editorialProfile,
    useEditorialProfile,
    customEditorialProfile,
    captionConfig,
    outputLanguage,

    // Actions
    setPrompt,
    setSystemPrompt,
    setShowAdvanced,
    setError,
    toggleVideoSelection,
    onRefresh,
    handleSubmit,
    handleReset,
    setCaptionConfig,
    setUseEditorialProfile,
    setCustomEditorialProfile,
    setOutputLanguage,
  };
}
