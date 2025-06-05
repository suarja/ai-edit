import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnyVideoType, GeneratedVideoType } from '@/types/video';
import { RefreshCcw } from 'lucide-react-native';
import VideoPlayer from '@/components/VideoPlayer';
import VideoHeader from '@/components/VideoHeader';
import VideoDetails from '@/components/VideoDetails';
import VideoActionButtons from '@/components/VideoActionButtons';
import { env } from '@/lib/config/env';

export default function GeneratedVideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [video, setVideo] = useState<GeneratedVideoType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = async () => {
    try {
      setError(null);
      console.log('fetching video details', id);
      // Get video request details
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
        .single();

      if (videoError) throw videoError;

      // Format the video to match our GeneratedVideoType
      const formattedVideo: GeneratedVideoType = {
        id: videoRequest.id,
        type: 'generated',
        created_at: videoRequest.created_at,
        render_status: videoRequest.render_status,
        render_url: videoRequest.render_url,
        script: videoRequest.script_id,
      };

      // Set the video details
      setVideo(formattedVideo);

      // If the video is still rendering, check the current status
      if (videoRequest.render_status === 'rendering') {
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
      const response = await fetch(`${env.SERVER_URL}/api/videos/status/${id}`);

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVideoDetails();
  };

  const handleShare = async () => {
    // Let the VideoActionButtons component handle this
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
              Your video is being processed. This may take a few minutes.
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const getVideoTitle = () => {
    if (!video) return 'Video Details';

    switch (video.render_status) {
      case 'rendering':
        return 'Processing Video';
      case 'done':
        return 'Video Ready';
      case 'error':
        return 'Video Error';
      default:
        return 'Video Details';
    }
  };

  const getVideoSubtitle = () => {
    if (!video) return undefined;

    const date = new Date(video.created_at).toLocaleDateString();
    return `Created ${date}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <VideoHeader title="Video Details" />
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

        <VideoActionButtons video={video} layout="row" onShare={handleShare} />
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
});
