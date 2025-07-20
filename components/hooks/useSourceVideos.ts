import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ViewabilityConfig } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { SupportService } from '@/lib/services/support/supportService';
import { useAuth } from '@clerk/clerk-expo';
import {
  VideoTypeWithAnalysis,
  VideoAnalysisData,
} from '@/lib/types/videoAnalysis';
import { API_ENDPOINTS } from '@/lib/config/api';
import { Json } from '@/lib/types/supabase-types';

export interface UseSourceVideos {
 
  data: {
    videos: VideoTypeWithAnalysis[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    playingVideoId: string | null;
    loadingVideoIds: Set<string>;
    errorVideoIds: Set<string>;
    visibleVideoIds: Set<string>;
    editingVideo: {
      id: string | null;
      title: string;
      description: string;
      tags: string;
    };
    canUploadMore: boolean;
    editingVideoId: string | null;
    savingMetadata: boolean;
    showSupportButton: boolean;
    currentVideoId: string | null;
    hasAnalysisData: boolean;
    viewabilityConfigCallbackPairs: {
      viewabilityConfig: ViewabilityConfig;
    }[];
  },
  actions: {
    fetchVideos: () => Promise<void>;
    onRefresh: () => Promise<void>;
    handleUploadComplete: (data: {
      videoStoragePath: string;
      url: string;
      videoDuration: number;
    }) => Promise<string>;
    handleUploadError: (error: Error) => void;
    handleAnalysisComplete: (
      data: VideoAnalysisData | null,
      videoId: string,
      manualEditRequired: boolean
    ) => Promise<void>;
    rejectAnalysis: () => Promise<void>;
    updateVideoMetadata: (metadata: {
      title: string;
      description: string;
      tags: string[];
    }) => Promise<void>;
    handleVideoPress: (video: VideoTypeWithAnalysis) => void;
    handlePlayToggle: (videoId: string) => void;
    handleVideoLoadStart: (videoId: string) => void;
    handleVideoLoad: (videoId: string) => void;
    handleVideoError: (videoId: string) => void;
    handleError: (error: Error | string, context?: Record<string, any>) => Promise<void>;
    getPresignedUrl: (fileName: string, fileType: string, fileSize?: number) => Promise<{
      presignedUrl: string;
      publicUrl: string;
      s3FileName: string;
    }>;
    canUploadMore: boolean;
    setEditingVideo:React.Dispatch<React.SetStateAction<{
    id: string | null;
    title: string;
    description: string;
    tags: string;
}>>;
    setEditingVideoId: (videoId: string | null) => void;
    setCurrentVideoId: (videoId: string | null) => void;
    clearError: () => void;
    setShowSupportButton: (show: boolean) => void;
  }
  
}

export function useSourceVideos(): UseSourceVideos {
  const [videos, setVideos] = useState<VideoTypeWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [loadingVideoIds, setLoadingVideoIds] = useState<Set<string>>(
    new Set()
  );
  const [errorVideoIds, setErrorVideoIds] = useState<Set<string>>(new Set());
  const [visibleVideoIds, setVisibleVideoIds] = useState<Set<string>>(
    new Set()
  );
  const [editingVideo, setEditingVideo] = useState<{
    id: string | null;
    title: string;
    description: string;
    tags: string;
  }>({ id: null, title: '', description: '', tags: '' });
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [showSupportButton, setShowSupportButton] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [hasAnalysisData, setHasAnalysisData] = useState(false);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
    minimumViewTime: 1000,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: { item: VideoTypeWithAnalysis }[];
    }) => {
      const visibleIds = new Set(viewableItems.map(({ item }) => item.id));
      setVisibleVideoIds(visibleIds);
    },
    []
  );

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]).current;

  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  const {
    currentPlan,
    isReady: revenueCatReady,
    userUsage,
    sourceVideosRemaining,
  } = useRevenueCat();
  const { getToken } = useAuth();

  const clearError = useCallback(() => {
    if (error) setError(null);
  }, [error]);

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkLoaded, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      if (clerkLoaded && isSignedIn && !loading) {
        fetchVideos();
      }
    }, [clerkLoaded, isSignedIn, loading])
  );

  const fetchVideos = async () => {
    try {
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVideos((data || []) as unknown as VideoTypeWithAnalysis[]);
    } catch (err) {
      setError('Échec du chargement des vidéos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    clearError();
    await fetchVideos();
    setRefreshing(false);
  }, [clearError]);

  const handleUploadComplete = async (data: {
    videoStoragePath: string;
    url: string;
    videoDuration: number;
  }): Promise<string> => {
    try {
      console.log('handleUploadComplete', data);
      clearError();
      if (currentPlan === 'free' && sourceVideosRemaining <= 0) {
        setError(
          `Limite atteinte : ${
            userUsage?.source_videos_limit || 0
          } vidéos sources maximum pour votre plan. Passez Pro pour en uploader plus.`
        );
        throw new Error('Source video limit reached');
      }
      const user = await fetchUser();
      if (!user) throw new Error('User not authenticated');
      const { error, data: videoData } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: '',
          description: '',
          tags: [],
          upload_url: data.url,
          storage_path: data.videoStoragePath,
          duration_seconds: data.videoDuration,
          analysis_status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      if (!videoData) throw new Error('No video data returned after insertion');
      await fetchVideos();
      setCurrentVideoId(videoData.id);
      return videoData.id;
    } catch (error) {
      setError('Échec de la sauvegarde des informations de la vidéo');
      throw error;
    }
  };

  const handleUploadError = (error: Error) => setError(error.message);

  const handleAnalysisComplete = async (
    data: VideoAnalysisData | null,
    videoId: string,
    manualEditRequired: boolean
  ) => {
    console.log('handleAnalysisComplete', data, videoId, manualEditRequired);

    try {
      if (manualEditRequired || !data) {
        console.log('manualEditRequired', manualEditRequired);
        const { error } = await supabase
          .from('videos')
          .update({ analysis_status: 'failed', analysis_data: null })
          .eq('id', videoId);
        if (error) throw error;
        setEditingVideo({
          id: videoId,
          title: '',
          description: '',
          tags: '',
        });
        setHasAnalysisData(false);
      } else {
        console.log('data', data);
        const { error } = await supabase
          .from('videos')
          .update({
            analysis_status: 'completed',
            analysis_data: data as unknown as Json,
            description: data.description,
            title: data.title,
            tags: data.tags,
            analysis_completed_at: new Date().toISOString(),
            analysis_error: null,
          })
          .eq('id', videoId);
        if (error) throw error;
        setEditingVideo({
          id: videoId,
          title: data.title || '',
          description: data.description || '',
          tags: data.tags?.join(', ') || '',
        });
        setHasAnalysisData(true);
      }
      await fetchVideos();
    } catch (error) {
      setError("Échec de la sauvegarde des résultats d'analyse");
    }
  };

  const rejectAnalysis = async () => {
    if (!editingVideoId) return;
    try {
      const { error } = await supabase
        .from('videos')
        .update({ analysis_status: 'failed', analysis_data: null })
        .eq('id', editingVideoId);
      if (error) throw error;
      setEditingVideo({
        id: editingVideoId,
        title: '',
        description: '',
        tags: '',
      });
      await fetchVideos();
    } catch (error) {
      setError("Échec du rejet de l'analyse");
    }
  };

  const updateVideoMetadata = async (metadata: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    setSavingMetadata(true);
    clearError();
    try {
      if (!editingVideo.id) {
        throw new Error('Editing video ID is required');
      }
      const tagsArray = metadata.tags;
      if (tagsArray.length === 0) {
        Alert.alert('Erreur', 'Au moins un tag est requis');
        setSavingMetadata(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: metadata.title,
          description: metadata.description,
          tags: tagsArray,
          analysis_status: 'completed',
        })
        .eq('id', editingVideo.id);
      if (updateError) throw updateError;
      setEditingVideoId(null);
      setEditingVideo({ id: null, title: '', description: '', tags: '' });
      setCurrentVideoId(null);
      await fetchVideos();
    } catch (err) {
      setError('Échec de la mise à jour des métadonnées');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleVideoPress = (video: VideoTypeWithAnalysis) => {
    clearError();
    setPlayingVideoId(null);
    router.push(`/video-details/${video.id}`);
  };

  const handlePlayToggle = (videoId: string) => {
    clearError();
    setPlayingVideoId((prev) => (prev === videoId ? null : videoId));
  };

  const handleVideoLoadStart = (videoId: string) => {
    setLoadingVideoIds((prev) => new Set(prev).add(videoId));
  };

  const handleVideoLoad = (videoId: string) => {
    setLoadingVideoIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  const handleVideoError = (videoId: string) => {
    setLoadingVideoIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
    setErrorVideoIds((prev) => new Set(prev).add(videoId));
  };

  const handleError = async (
    error: Error | string,
    context?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;
    clearError();
    let userMessage = 'Une erreur est survenue';
    if (errorMessage.includes('quota')) {
      userMessage =
        "Limite d'analyse quotidienne atteinte. Réessayez demain ou passez au plan Pro.";
    } else if (errorMessage.includes('trop volumineuse')) {
      userMessage = 'La vidéo est trop volumineuse (max 100MB)';
    } else if (
      errorMessage.includes('format') ||
      errorMessage.includes('corrompu')
    ) {
      userMessage =
        'Format de vidéo non supporté ou fichier corrompu. Essayez avec une autre vidéo.';
    } else {
      userMessage =
        "Échec de l'analyse. Vous pouvez remplir les informations manuellement.";
      setShowSupportButton(true);
    }
    setError(userMessage);
    try {
      const token = await getToken();
      if (token) {
        await SupportService.reportIssue({
          jobId: 'video-analysis-error',
          errorMessage: errorMessage,
          token,
          context: {
            ...context,
            videosCount: videos.length,
            currentPlan,
            lastAction: 'video_analysis',
          },
        });
      }
    } catch {}
  };

  const getPresignedUrl = async (
    fileName: string,
    fileType: string,
    fileSize?: number
  ) => {
    const token = await getToken();
    if (!token) throw new Error('Authentification requise');
    const res = await fetch(API_ENDPOINTS.S3_UPLOAD(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileName, fileType, fileSize }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Erreur S3: ' + errorText);
    }
    const { data } = await res.json();
    return {
      presignedUrl: data.presignedUrl,
      publicUrl: data.publicUrl,
      s3FileName: data.fileName,
    };
  };

  const canUploadMore = currentPlan !== 'free' || sourceVideosRemaining > 0;

  return {
    data:{ 
      videos,
    loading,
    error,
    refreshing,
    playingVideoId,
    loadingVideoIds,
    errorVideoIds,
    visibleVideoIds,
    editingVideo,
    editingVideoId,
    savingMetadata,
    showSupportButton,
    currentVideoId,
    hasAnalysisData,
    canUploadMore,
    viewabilityConfigCallbackPairs,}, 
    
    actions:{fetchVideos,
    onRefresh,
    handleUploadComplete,
    handleUploadError,
    handleAnalysisComplete,
    rejectAnalysis,
    updateVideoMetadata,
    handleVideoPress,
    handlePlayToggle,
    handleVideoLoadStart,
    handleVideoLoad,
    handleVideoError,
    handleError,
    getPresignedUrl,
    canUploadMore,
    setEditingVideo,
    setEditingVideoId,
    setCurrentVideoId,
    clearError,
    setShowSupportButton,},
   
    
  };
}
