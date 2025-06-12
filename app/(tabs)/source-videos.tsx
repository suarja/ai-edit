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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Video as VideoIcon,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoUploader from '@/components/VideoUploader';
import VideoCard from '@/components/VideoCard';
import { VideoType } from '@/types/video';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';

export default function SourceVideosScreen() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [loadingVideoIds, setLoadingVideoIds] = useState<Set<string>>(
    new Set()
  );
  const [errorVideoIds, setErrorVideoIds] = useState<Set<string>>(new Set());
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

  // Use Clerk-authenticated Supabase client
  const { client: supabase, user, isLoaded } = useClerkSupabaseClient();

  useEffect(() => {
    if (isLoaded && user) {
      fetchVideos();
    }
  }, [isLoaded, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, []);

  const fetchVideos = async () => {
    try {
      if (!user?.id) {
        console.error('No Clerk user ID found');
        setError("Erreur d'authentification");
        return;
      }

      console.log('🔍 Fetching videos for Clerk user:', user.id);

      // Use clerk_user_id field if it exists, otherwise fallback to user_id for migration
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .or(`clerk_user_id.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(
        '✅ Videos fetched successfully:',
        data?.length || 0,
        'videos'
      );
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
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving video for Clerk user:', user.id);

      const { error } = await supabase.from('videos').insert({
        clerk_user_id: user.id, // Use Clerk user ID
        title: '',
        description: '',
        tags: [],
        upload_url: data.url,
        storage_path: data.videoId,
        duration_seconds: 0,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Video saved successfully');
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

      Alert.alert(
        'Succès',
        'Les métadonnées de la vidéo ont été mises à jour avec succès.'
      );
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video metadata');
    }
  };

  const handleVideoPress = (video: VideoType) => {
    setPlayingVideoId(null); // Stop any playing video
    router.push(`/video-details/${video.id}`);
  };

  const handlePlayToggle = (videoId: string) => {
    if (playingVideoId === videoId) {
      setPlayingVideoId(null);
    } else {
      setPlayingVideoId(videoId);
    }
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
              <Text style={styles.formTitle}>
                Ajouter des métadonnées (optionnel)
              </Text>

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

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setEditingVideo({
                      id: null,
                      title: '',
                      description: '',
                      tags: '',
                    });
                  }}
                >
                  <Text style={styles.skipButtonText}>
                    Ignorer pour l'instant
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    !editingVideo.title && styles.buttonDisabled,
                  ]}
                  onPress={updateVideoMetadata}
                  disabled={!editingVideo.title}
                >
                  <Text style={styles.buttonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.videosList}>
          <Text style={styles.sectionTitle}>Vos Vidéos</Text>
          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <VideoIcon size={48} color="#555" />
              <Text style={styles.emptyText}>Aucune vidéo uploadée</Text>
              <Text style={styles.emptySubtext}>
                Commencez par uploader votre première vidéo
              </Text>
            </View>
          ) : (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isPlaying={playingVideoId === video.id}
                isLoading={loadingVideoIds.has(video.id)}
                hasError={errorVideoIds.has(video.id)}
                onPress={() => handleVideoPress(video)}
                onPlayToggle={() => handlePlayToggle(video.id)}
                onLoadStart={() => handleVideoLoadStart(video.id)}
                onLoad={() => handleVideoLoad(video.id)}
                onError={() => handleVideoError(video.id)}
              />
            ))
          )}
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
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
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
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
  },
});
