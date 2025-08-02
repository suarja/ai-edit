import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { 
  VideoType, 
  CaptionConfiguration, 
  Language,
  VideoTemplateService
} from '@/lib/types/video.types';
import { VideoValidationService } from '@/lib/services/video/validation';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';
import { API_ENDPOINTS } from '@/lib/config/api';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';
import { ScriptService } from '@/lib/services/scriptService';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { VideoEditorialProfile } from 'editia-core';
// Default language (using shared Language type)
const DEFAULT_LANGUAGE: Language = 'fr';

// Default editorial profile (using shared VideoEditorialProfile type)
const DEFAULT_EDITORIAL_PROFILE: VideoEditorialProfile = {
  persona_description:
    'Créateur de contenu professionnel axé sur une communication claire et engageante',
  tone_of_voice: 'Conversationnel et amical, tout en restant professionnel',
  audience: "Professionnels passionnés par la productivité et l'innovation",
  style_notes:
    'Explications claires avec des exemples pratiques, maintenant un équilibre entre informatif et engageant',
};

// Default enhanced caption configuration
const DEFAULT_CAPTION_CONFIG = CaptionConfigStorage.getDefault();

// Database editorial profile type (for Supabase queries)
type DatabaseEditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
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
    useState<DatabaseEditorialProfile | null>(null);
  const [useEditorialProfile, setUseEditorialProfile] = useState(true);
  const [customEditorialProfile, setCustomEditorialProfile] =
    useState<VideoEditorialProfile>(DEFAULT_EDITORIAL_PROFILE);
  const [captionConfig, setCaptionConfig] = useState<CaptionConfiguration>(
    DEFAULT_CAPTION_CONFIG
  );
  // Language state with typed Language from editia-core
  const [outputLanguage, setOutputLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  console.log( ' ✅ hook useVideoRequest');
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
      setEditorialProfile(profile as unknown as DatabaseEditorialProfile);

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
    console.log('validateRequest');
    // Legacy checks first
    if (!scriptId) {
      throw new Error(
        'Script manquant : veuillez sélectionner un script pour générer une vidéo.'
      );
    }

    if (!currentPlan) {
      throw new Error('Plan manquant : veuillez sélectionner un plan pour générer une vidéo.');
    }

    if (!userUsage) {
      throw new Error('Utilisateur manquant : veuillez sélectionner un utilisateur pour générer une vidéo.');
    }
    
    // Script validation using existing ScriptService
    const { isValid, warnings } = ScriptService.validateScript({
      script: prompt, 
      plan: currentPlan, 
      userUsage, 
      videos: selectedVideos
    });
    console.log('isValid', isValid);
    console.log('warnings', warnings);
    if (!isValid) {
      throw new Error(warnings.join('\n'));
    }

    // Prepare editorial profile for validation
    const profileData = useEditorialProfile
      ? convertDatabaseToVideoProfile(editorialProfile) || DEFAULT_EDITORIAL_PROFILE
      : customEditorialProfile;

    // Use VideoValidationService for comprehensive validation
    const validationPayload = {
      prompt,
      systemPrompt,
      selectedVideos,
      editorialProfile: profileData,
      voiceId: voiceClone?.voiceId,
      captionConfig,
      outputLanguage,
    };
    const validationResult = VideoValidationService.validateRequest(validationPayload);
    if (!validationResult.success) {
      console.log('validationResult', validationResult.details);
      throw new Error(validationResult.details.message);
    }

    // Additional template validation using VideoTemplateService
    if (prompt && selectedVideos.length > 0) {
      console.log('validateTemplate');
      const templateValidation = VideoTemplateService.validateTemplate(
        prompt,
        selectedVideos,
        captionConfig
      );
              console.log('templateValidation', templateValidation);

      if (!templateValidation.isValid) {
        console.log('templateValidation', templateValidation);
        throw new Error(templateValidation.errors.join('\n'));
      }
      
      // Show warnings to console (could be shown to user in future)
      if (templateValidation.warnings.length > 0) {
        console.warn('Template validation warnings:', templateValidation.warnings);
      }
    }

    return true;
  };

  // Helper function to convert database profile to VideoEditorialProfile
  const convertDatabaseToVideoProfile = (
    dbProfile: DatabaseEditorialProfile | null
  ): VideoEditorialProfile | null => {
    if (!dbProfile) return null;
    
    return {
      persona_description: dbProfile.persona_description || DEFAULT_EDITORIAL_PROFILE.persona_description,
      tone_of_voice: dbProfile.tone_of_voice || DEFAULT_EDITORIAL_PROFILE.tone_of_voice,
      audience: dbProfile.audience || DEFAULT_EDITORIAL_PROFILE.audience,
      style_notes: dbProfile.style_notes || DEFAULT_EDITORIAL_PROFILE.style_notes,
    };
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
    console.log('handleSubmit');
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

      console.log('voiceClone', voiceClone, 'requestPayload.voiceId', requestPayload.voiceId);

      // Get Clerk token for API authentication
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error('No authentication token available');
      }
      console.log('about to send request');
      const response = await fetch(
        API_ENDPOINTS.SCRIPT_GENERATE_VIDEO(scriptId!),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clerkToken}`,
          },
          body: JSON.stringify(requestPayload),
        }
      );

      const result = await response.json();
      console.log('result', result);
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la vidéo.');
      }

      // Reset form after successful submission
      handleReset();
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
