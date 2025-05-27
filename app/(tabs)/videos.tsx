import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  Film,
  MoveVertical as MoreVertical,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type VideoRequest = {
  id: string;
  script_id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_id?: string;
  created_at: string;
  script?: {
    raw_prompt: string;
  };
};

export default function GeneratedVideosScreen() {
  const [videos, setVideos] = useState<VideoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      console.log('videos page');
      const { data, error } = await supabase
        .from('video_requests')
        .select(
          `
          id,
          script_id,
          render_status,
          render_url,
          render_id,
          created_at,
          script_id
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);

      // Check status for rendering videos
      const renderingVideos =
        data?.filter((v: VideoRequest) => v.render_status === 'rendering') ||
        [];

      for (const video of renderingVideos) {
        console.log('checking video status', video.id);
        await checkVideoStatus(video.id);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkVideoStatus = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/status/${videoId}`);

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        throw new Error('Failed to check status');
      }

      const data: VideoRequest = await response.json();

      // Update video in state if status changed
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, ...data } : v))
      );

      // Continue polling if still rendering (every 10 seconds)
      if (data.render_status === 'rendering') {
        setTimeout(() => checkVideoStatus(videoId), 30000);
      }
    } catch (err) {
      console.error('Error checking video status:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, []);

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

  const truncateText = (
    text: string | undefined,
    maxLength: number = 50
  ): string => {
    if (!text) return 'Sans titre';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
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
        <Text style={styles.title}>Vidéos Générées</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.videoItem}>
            <View style={styles.videoInfo}>
              <Film size={24} color="#fff" />
              <View style={styles.textContainer}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {truncateText(item.script?.raw_prompt)}
                </Text>
                <Text style={styles.videoDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.status,
                  {
                    color: getStatusColor(item.render_status),
                    backgroundColor: getStatusBgColor(item.render_status),
                  },
                ]}
              >
                {item.render_status}
              </Text>
              <TouchableOpacity>
                <MoreVertical size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  videoItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textContainer: {
    gap: 4,
    flex: 1,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  videoDate: {
    color: '#888',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
