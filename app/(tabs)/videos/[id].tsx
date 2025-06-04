import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Download,
  Share2,
  RefreshCcw,
  Film,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

type VideoDetails = {
  id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_snapshot_url: string | null;
  render_duration: number | null;
  render_width: number | null;
  render_height: number | null;
  render_error: string | null;
  created_at: string;
  script: {
    id: string;
    raw_prompt: string;
    generated_script: string;
  } | null;
};

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

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
          )
        `
        )
        .eq('id', id)
        .single();

      if (videoError) throw videoError;

      // Set the video details
      setVideoDetails(videoRequest as any);

      // If the video is still rendering, check the current status
      if ((videoRequest as any).render_status === 'rendering') {
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
    try {
      const response = await fetch(`/api/videos/status/${id}`);

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        return;
      }

      const data = await response.json();

      // Update video details if status changed
      if (
        data.render_status !== videoDetails?.render_status ||
        data.render_url !== videoDetails?.render_url
      ) {
        setVideoDetails((prev) => (prev ? { ...prev, ...data } : null));
      }

      // Continue polling if still rendering (every 30 seconds)
      if (data.render_status === 'rendering') {
        setTimeout(checkVideoStatus, 30000);
      }
    } catch (err) {
      console.error('Error checking video status:', err);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVideoDetails();
  };

  const handleShare = async () => {
    if (!videoDetails?.render_url) return;

    try {
      await Share.share({
        message: `Check out my AI-generated video: ${videoDetails.render_url}`,
        url: videoDetails.render_url, // iOS only
      });
    } catch (err) {
      console.error('Error sharing video:', err);
    }
  };

  const handleDownload = async () => {
    if (!videoDetails?.render_url) return;

    // On web, this will open the video in a new tab
    // On mobile, this will open the default browser or video player
    await Linking.openURL(videoDetails.render_url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#4ADE80';
      case 'rendering':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#888';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#0A2F1E';
      case 'rendering':
        return '#2E1F05';
      case 'error':
        return '#2D1116';
      default:
        return '#1a1a1a';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Video Details</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!videoDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Video Details</Text>
        </View>

        <View style={styles.centerContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>Video not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Video Details</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <RefreshCcw size={20} color={refreshing ? '#666' : '#fff'} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorMessageText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.status,
              {
                color: getStatusColor(videoDetails.render_status),
                backgroundColor: getStatusBgColor(videoDetails.render_status),
              },
            ]}
          >
            {videoDetails.render_status.toUpperCase()}
          </Text>
          <Text style={styles.dateText}>
            {new Date(videoDetails.created_at).toLocaleString()}
          </Text>
        </View>

        {/* Video Title/Prompt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prompt</Text>
          <Text style={styles.promptText}>
            {videoDetails.script?.raw_prompt || 'No prompt available'}
          </Text>
        </View>

        {/* Video Preview (if done) */}
        {videoDetails.render_status === 'done' && videoDetails.render_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video Preview</Text>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{ uri: videoDetails.render_url }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
            />

            <View style={styles.videoActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share2 size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
              >
                <Download size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Thumbnail (if available) */}
        {videoDetails.render_status === 'rendering' &&
          videoDetails.render_snapshot_url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview (Processing)</Text>
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: videoDetails.render_snapshot_url }}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
                <ActivityIndicator
                  style={styles.thumbnailOverlay}
                  size="large"
                  color="#007AFF"
                />
              </View>
              <Text style={styles.processingText}>
                Your video is being processed. This may take a few minutes.
              </Text>
            </View>
          )}

        {/* Error message (if error) */}
        {videoDetails.render_status === 'error' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Error</Text>
            <View style={styles.errorBox}>
              <AlertCircle size={24} color="#EF4444" />
              <Text style={styles.errorText}>
                {videoDetails.render_error ||
                  'An error occurred during video processing'}
              </Text>
            </View>
          </View>
        )}

        {/* Video Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>{videoDetails.render_status}</Text>
          </View>

          {videoDetails.render_duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {formatDuration(videoDetails.render_duration)}
              </Text>
            </View>
          )}

          {videoDetails.render_width && videoDetails.render_height && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Resolution</Text>
              <Text style={styles.detailValue}>
                {videoDetails.render_width} × {videoDetails.render_height}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(videoDetails.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Script */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Script</Text>
          <View style={styles.scriptContainer}>
            <Text style={styles.scriptText}>
              {videoDetails.script?.generated_script || 'No script available'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  errorMessageText: {
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    color: '#888',
    fontSize: 14,
  },
  promptText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  videoPlayer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  thumbnailContainer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#F59E0B',
    fontSize: 14,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scriptContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  scriptText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
