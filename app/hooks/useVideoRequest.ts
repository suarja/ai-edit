import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { VideoType, CaptionConfiguration } from '@/lib/types/video.types';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';
import { API_ENDPOINTS } from '@/lib/config/api';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';
import { ScriptService } from '@/lib/services/scriptService';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

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
  const { currentPlan, userUsage } = useRevenueCat();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<VideoType[]>([]);
  const [sourceVideos, setSourceVideos] = useState<VideoType[]>([]);
  const [voiceClone, setVoiceClone] = useState<VoiceConfig | null>(null);
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

      const voice = await VoiceService.getSelectedVoice(user.id);
      setVoiceClone(voice);

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

  const toggleVideoSelection = (video: VideoType) => {
    setSelectedVideos((prev) =>
      prev.includes(video)
        ? prev.filter((id) => id !== video)
        : [...prev, video]
    );
  };

  const validateRequest = () => {
    if (!scriptId) {
      throw new Error(
        'Script manquant : veuillez sélectionner un script pour générer une vidéo.'
      );
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error(
        'Description manquante : veuillez entrer une description de la vidéo.'
      );
    }

    if (!currentPlan) {
      throw new Error('Plan manquant : veuillez sélectionner un plan pour générer une vidéo.');
    }

    if (!userUsage) {
      throw new Error('Utilisateur manquant : veuillez sélectionner un utilisateur pour générer une vidéo.');
    }

    const { isValid, warnings } = ScriptService.validateScript({script: prompt, plan: currentPlan, userUsage, videos: selectedVideos});
    if (!isValid) {
      throw new Error(warnings.join('\n'));
    }

    if (
      !useEditorialProfile &&
      !customEditorialProfile.persona_description.trim()
    ) {
      throw new Error(
        'Détails éditoriaux manquants : veuillez fournir des détails sur votre style de contenu.'
      );
    }

    // Enhanced validation: only check if captions are enabled and missing required fields
    if (
      captionConfig.enabled &&
      (!captionConfig.presetId || !captionConfig.transcriptColor)
    ) {
      throw new Error(
        'Configuration des sous-titres incomplète : veuillez configurer complètement vos sous-titres ou les désactiver.'
      );
    }

    if (!outputLanguage) {
      throw new Error(
        'Langue de sortie manquante : veuillez sélectionner une langue pour votre vidéo.'
      );
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
    try {
      validateRequest();
    } catch (validationError) {
      throw validationError;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Get the database user
      const user = await fetchUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié.');
      }

      // Get latest caption config to ensure we have the most recent settings
      const currentCaptionConfig = await CaptionConfigStorage.getOrDefault(
        user.id
      );

      // Get storage paths for selected videos
      const selectedVideoData = sourceVideos.filter((video) =>
        selectedVideos.includes(video)
      );

      // Prepare editorial profile data
      const profileData = useEditorialProfile
        ? editorialProfile || DEFAULT_EDITORIAL_PROFILE
        : customEditorialProfile;

      const requestPayload = {
        script: prompt && typeof prompt === 'string' ? prompt.trim() : '',
        systemPrompt:
          systemPrompt && typeof systemPrompt === 'string'
            ? systemPrompt.trim()
            : '',
        selectedVideos: selectedVideoData,
        voiceId:
          voiceClone?.voiceId ||
          (await VoiceConfigStorage.getDefaultVoice(user.id))?.voiceId,
        editorialProfile: profileData,
        captionConfig: currentCaptionConfig, // Use fresh config
        outputLanguage: outputLanguage,
      };

      // Get Clerk token for API authentication
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error('No authentication token available');
      }

      // const response = await fetch(
      //   API_ENDPOINTS.SCRIPT_GENERATE_VIDEO(scriptId!),
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${clerkToken}`,
      //     },
      //     body: JSON.stringify(requestPayload),
      //   }
      // );

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error('Erreur lors de la génération de la vidéo.');
      // }

      // // Reset form after successful submission
      // handleReset();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      throw err;
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
    setScriptId,
  };
}
