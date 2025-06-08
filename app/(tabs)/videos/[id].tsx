import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnyVideoType, GeneratedVideoType } from '@/types/video';
import { RefreshCcw } from 'lucide-react-native';
import VideoPlayer from '@/components/VideoPlayer';
import VideoHeader from '@/components/VideoHeader';
import VideoDetails from '@/components/VideoDetails';
import VideoActionButtons from '@/components/VideoActionButtons';
import { env } from '@/lib/config/env';
import { API_ENDPOINTS } from '@/lib/config/api';

// Script type for proper TypeScript support
type ScriptData = {
  id: string;
  raw_prompt: string;
  generated_script: string;
  output_language: string;
};

// Video request type with proper script relation
type VideoRequestWithScript = {
  id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  created_at: string;
  script_id: string;
  script: ScriptData;
};

// Extended type to include script information
type EnhancedGeneratedVideoType = GeneratedVideoType & {
  title?: string;
  description?: string;
  prompt?: string;
  script_content?: string;
  output_language?: string;
};

export default function GeneratedVideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [video, setVideo] = useState<EnhancedGeneratedVideoType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = async () => {
    try {
      setError(null);
      console.log('fetching video details', id);

      // Get video request details with script information
      const { data: videoRequest, error: videoError } = await supabase
        .from('video_requests')
        .select(
          `
          id,
          render_status,
          render_url,
          created_at,
          script_id,
          script:scripts!inner(
            id,
            raw_prompt,
            generated_script,
            output_language
          )
          `
        )
        .eq('id', id)
        .single();

      if (videoError) {
        console.error('Supabase error:', videoError);
        throw videoError;
      }

      if (!videoRequest) {
        throw new Error('Video not found');
      }

      // Check if script data is properly loaded
      if (!videoRequest.script || typeof videoRequest.script !== 'object') {
        console.error('Script data not loaded properly:', videoRequest);
        throw new Error('Script information could not be loaded');
      }

      // Type assertion after validation
      const typedVideoRequest =
        videoRequest as unknown as VideoRequestWithScript;

      // Extract script information with additional safety checks
      const script = typedVideoRequest.script;
      const prompt = script?.raw_prompt || '';

      // Create title from prompt (first 60 characters for details page)
      const title =
        prompt.length > 60
          ? `${prompt.slice(0, 60)}...`
          : prompt || 'Vidéo sans titre';

      // Create description with status and language
      const statusMap: Record<string, string> = {
        queued: "En file d'attente",
        rendering: 'En cours de génération',
        done: 'Vidéo prête',
        error: 'Erreur de génération',
      };
      const statusText =
        statusMap[typedVideoRequest.render_status] ||
        typedVideoRequest.render_status;

      const description = `${statusText}${
        script?.output_language
          ? ` • Langue: ${script.output_language?.toUpperCase()}`
          : ''
      }`;

      // Format the video to match our GeneratedVideoType with enhancements
      const formattedVideo: EnhancedGeneratedVideoType = {
        id: typedVideoRequest.id as string,
        type: 'generated',
        created_at: typedVideoRequest.created_at as string,
        render_status: typedVideoRequest.render_status,
        render_url: typedVideoRequest.render_url,
        script: typedVideoRequest.script_id as string,
        title,
        description,
        prompt: script?.raw_prompt,
        script_content: script?.generated_script,
        output_language: script?.output_language,
      };

      // Set the video details
      setVideo(formattedVideo);

      // If the video is still rendering, check the current status
      if (typedVideoRequest.render_status === 'rendering') {
        checkVideoStatus();
      }
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError('Failed to load video details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkVideoStatus = async () => {
    if (!video) return;

    try {
      const response = await fetch(
        API_ENDPOINTS.VIDEO_STATUS(video.id as string)
      );

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        return;
      }

      const data = await response.json();

      // Update video details if status changed
      if (
        data.render_status !== video.render_status ||
        data.render_url !== video.render_url
      ) {
        setVideo((prev) => {
          if (!prev) return null;

          // Update status description when status changes
          const statusMap: Record<string, string> = {
            queued: "En file d'attente",
            rendering: 'En cours de génération',
            done: 'Vidéo prête',
            error: 'Erreur de génération',
          };
          const statusText =
            statusMap[data.render_status] || data.render_status;

          const description = `${statusText}${
            prev.output_language
              ? ` • Langue: ${prev.output_language.toUpperCase()}`
              : ''
          }`;

          return {
            ...prev,
            render_status: data.render_status,
            render_url: data.render_url,
            description,
          };
        });
      }

      // Continue polling if still rendering (every 30 seconds)
      if (data.render_status === 'rendering') {
        setTimeout(checkVideoStatus, 30000);
      }
    } catch (err) {
      console.error('Error checking video status:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVideoDetails();
  };

  const handleBackToVideos = () => {
    // Navigate specifically to the videos list page
    router.push('/(tabs)/videos');
  };

  // Render thumbnail for rendering videos
  const renderThumbnail = () => {
    if (!video) return null;

    if (video.render_status === 'rendering') {
      return (
        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnailOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>
              Votre vidéo est en cours de traitement. Cela peut prendre quelques
              minutes.
            </Text>
            {video.prompt && (
              <Text style={styles.promptText}>
                &quot;
                {video.prompt.length > 80
                  ? `${video.prompt.slice(0, 80)}...`
                  : video.prompt}
                &quot;
              </Text>
            )}
          </View>
        </View>
      );
    }
    return null;
  };

  const getVideoTitle = () => {
    if (!video) return 'Détails de la vidéo';

    // Use the actual title generated from prompt
    return video.title || 'Détails de la vidéo';
  };

  const getVideoSubtitle = () => {
    if (!video) return undefined;

    const date = new Date(video.created_at).toLocaleDateString('fr-FR');
    const language = video.output_language
      ? ` • ${video.output_language.toUpperCase()}`
      : '';
    return `Créée le ${date}${language}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <VideoHeader title="Détails de la vidéo" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <VideoHeader
        title={getVideoTitle()}
        subtitle={getVideoSubtitle()}
        onBack={handleBackToVideos}
        rightButton={{
          icon: <RefreshCcw size={20} color="#fff" />,
          onPress: handleRefresh,
          loading: refreshing,
        }}
        refreshing={refreshing}
      />

      <View style={styles.content}>
        {video && video.render_status === 'done' ? (
          <VideoPlayer video={video} />
        ) : (
          renderThumbnail()
        )}

        <VideoDetails video={video} error={error} />

        <VideoActionButtons video={video} layout="row" showCopyLink={true} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#1a1a1a',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  promptText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
