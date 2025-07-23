import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoPlayer from '@/components/VideoPlayer';
import VideoDetails from '@/components/VideoDetails';
import VideoActionButtons from '@/components/VideoActionButtons';
import { API_ENDPOINTS } from '@/lib/config/api';
import { EnhancedGeneratedVideoType } from '@/lib/types/video.types';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { useAuth } from '@clerk/clerk-expo';
import { VideoRequestStatus } from 'editia-core';

// Script type for proper TypeScript support
type ScriptData = {
  id: string;
  current_script: string;
  output_language: string;
};

// Video request type with proper script relation
type VideoRequestWithScript = {
  id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  created_at: string;
  script_id: string;
  scriptData: ScriptData;
};

export default function GeneratedVideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<EnhancedGeneratedVideoType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use Clerk authentication instead of direct Supabase
  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  const { getToken } = useAuth();

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchVideoDetails();
    }
  }, [id, clerkLoaded, isSignedIn]);

  const fetchVideoDetails = async () => {
    try {
      if (!id || typeof id !== 'string') {
        setError('Video ID is required');
        return;
      }
      setError(null);

      // Get the database user first
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Get video request details with script information using the database user ID
      const { data: videoRequest, error: videoError } = await supabase
        .from('video_requests')
        .select(
          `
          id,
          render_status,
          render_url,
          created_at,
          script_id
          `
        )
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only access their own videos
        .single();

      if (videoError) {
        console.error('Supabase error:', videoError);
        throw videoError;
      }

      if (!videoRequest.script_id) {
        throw new Error('Script ID is required');
      }

      const { data: scriptData, error: scriptError } = await supabase
        .from('script_drafts')
        .select('id, current_script, output_language')
        .eq('id', videoRequest.script_id)
        .single();

      if (scriptError) {
        throw new Error('Script not found');
      }

      const mergedVideoRequest = {
        ...videoRequest,
        scriptData,
      };

      // Check if script data is properly loaded
      if (
        !mergedVideoRequest ||
        typeof mergedVideoRequest.scriptData !== 'object'
      ) {
        console.error('Script data not loaded properly:', mergedVideoRequest);
        throw new Error('Script information could not be loaded');
      }

      // Type assertion after validation
      const typedVideoRequest =
        mergedVideoRequest as unknown as VideoRequestWithScript;

      // Extract script information with additional safety checks
      const script = typedVideoRequest.scriptData;
      const prompt = script?.current_script || '';

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
      const formattedVideo: any = {
        id: typedVideoRequest.id as string,
        created_at: typedVideoRequest.created_at as string,
        render_status: typedVideoRequest.render_status,
        render_url: typedVideoRequest.render_url,
        script: script,
        title,
        description,
        prompt: script?.current_script,
        script_content: script?.current_script,
        output_language: script?.output_language,
      };

      console.log('formattedVideo', formattedVideo);
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
    }
  };

  const checkVideoStatus = async () => {
    if (!video) return;

    try {
      // Get Clerk token for API authentication
      const clerkToken = await getToken();

      if (!clerkToken) {
        console.error('No Clerk token available for status check');
        return;
      }

      const response = await fetch(
        API_ENDPOINTS.VIDEO_STATUS(video.id as string),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clerkToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        return;
      }

      const data = await response.json();

      // Update video details if status changed
      if (data.status !== video.status || data.video_url !== video.video_url) {
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

          // const description = `${statusText}${
          //   prev.output_language
          //     ? ` • Langue: ${prev.output_language.toUpperCase()}`
          //     : ''
          // }`;

          return {
            ...prev,
            render_status: data.render_status,
            render_url: data.render_url,
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

  // Render thumbnail for rendering videos
  const renderThumbnail = () => {
    if (!video) return null;

    if (video.status === 'rendering') {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {video && video.status === 'done' ? (
            <VideoPlayer video={video} />
          ) : (
            renderThumbnail()
          )}

          <VideoDetails video={video} error={error} />

          <VideoActionButtons video={video} layout="row" showCopyLink={true} />
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    gap: 20,
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
