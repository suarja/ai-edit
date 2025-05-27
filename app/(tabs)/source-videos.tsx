import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  Video as VideoIcon,
  Tag,
  Clock,
  Trash2,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
import VideoUploader from '@/components/VideoUploader';

type VideoType = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upload_url: string;
  duration_seconds: number;
  created_at: string;
  storage_path?: string;
};

export default function SourceVideosScreen() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<{
    id: string | null;
    title: string;
    description: string;
    tags: string;
  }>({
    id: null,
    title: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, []);

  const fetchVideos = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Échec du chargement des vidéos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (data: {
    videoId: string;
    url: string;
  }) => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save the video info to the database
      const { error } = await supabase.from('videos').insert({
        user_id: user.id,
        title: '', // Will be updated in the form
        description: '',
        tags: [],
        upload_url: data.url,
        storage_path: data.videoId,
        duration_seconds: 0, // Will be updated later if needed
      });

      if (error) throw error;

      // Refresh videos and set the current one for editing
      await fetchVideos();
      setEditingVideo({
        id: data.videoId,
        title: '',
        description: '',
        tags: '',
      });
    } catch (error) {
      console.error('Error saving video data:', error);
      setError('Failed to save video information');
    }
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  const updateVideoMetadata = async () => {
    if (!editingVideo.id || !editingVideo.title) return;

    try {
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: editingVideo.title,
          description: editingVideo.description,
          tags: editingVideo.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        })
        .eq('storage_path', editingVideo.id);

      if (updateError) throw updateError;

      setEditingVideo({
        id: null,
        title: '',
        description: '',
        tags: '',
      });
      await fetchVideos();
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video metadata');
    }
  };

  const deleteVideo = async (id: string, fileKey: string) => {
    try {
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('storage_path', fileKey);

      if (dbError) throw dbError;

      await fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Échec de la suppression de la vidéo');
    }
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
        <Text style={styles.title}>Vidéos Sources</Text>
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

        <View style={styles.uploadSection}>
          <VideoUploader
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />

          {editingVideo.id && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Titre de la vidéo"
                placeholderTextColor="#666"
                value={editingVideo.title}
                onChangeText={(text) =>
                  setEditingVideo((prev) => ({ ...prev, title: text }))
                }
              />

              <TextInput
                style={styles.textArea}
                placeholder="Description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={editingVideo.description}
                onChangeText={(text) =>
                  setEditingVideo((prev) => ({ ...prev, description: text }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (séparés par des virgules)"
                placeholderTextColor="#666"
                value={editingVideo.tags}
                onChangeText={(text) =>
                  setEditingVideo((prev) => ({ ...prev, tags: text }))
                }
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  !editingVideo.title && styles.buttonDisabled,
                ]}
                onPress={updateVideoMetadata}
                disabled={!editingVideo.title}
              >
                <Text style={styles.buttonText}>
                  Mettre à jour les métadonnées
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.videosList}>
          <Text style={styles.sectionTitle}>Vos Vidéos</Text>
          {videos.map((video) => (
            <View key={video.id} style={styles.videoItem}>
              <View style={styles.videoPreview}>
                {video.upload_url ? (
                  <Video
                    source={{ uri: video.upload_url }}
                    style={styles.videoThumbnail}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isMuted={true}
                    useNativeControls={false}
                  />
                ) : (
                  <VideoIcon size={24} color="#fff" />
                )}
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                {video.description && (
                  <Text style={styles.videoDescription}>
                    {video.description}
                  </Text>
                )}
                <View style={styles.videoMeta}>
                  {video.tags && video.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      <Tag size={14} color="#888" />
                      <Text style={styles.tagText}>
                        {video.tags.join(', ')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.dateContainer}>
                    <Clock size={14} color="#888" />
                    <Text style={styles.dateText}>
                      {new Date(video.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteVideo(video.id, video.storage_path || '')}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
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
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  uploadSection: {
    gap: 20,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videosList: {
    marginTop: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  videoPreview: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    flex: 1,
    gap: 4,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoDescription: {
    color: '#888',
    fontSize: 14,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: '#888',
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
});
