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
  Crown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoUploader from '@/components/VideoUploader';
import VideoCard from '@/components/VideoCard';
import { VideoType } from '@/types/video';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useRevenueCat } from '@/providers/RevenueCat';

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
  const [savingMetadata, setSavingMetadata] = useState(false);

  // Use the same pattern as settings.tsx and videos.tsx
  const { fetchUser, clerkUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  
  // Get subscription info for free tier limits
  const { isPro, isReady: revenueCatReady } = useRevenueCat();

  // Constants for free tier limits
  const FREE_TIER_SOURCE_VIDEOS_LIMIT = 5;

  // Reset error when user interacts with the app
  const clearError = useCallback(() => {
    if (error) {
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchVideos();
    }
  }, [clerkLoaded, isSignedIn]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    clearError(); // Clear any previous errors
    await fetchVideos();
    setRefreshing(false);
  }, [clearError]);

  const fetchVideos = async () => {
    try {
      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        console.log('No database user found');
        router.replace('/(auth)/sign-in');
        return;
      }

      console.log('🔍 Fetching videos for database user ID:', user.id);

      // Use the database ID directly - no need to lookup again!
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id) // Use database ID directly instead of clerk_user_id
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
      clearError(); // Clear any previous errors

      // Check free tier limit before saving
      if (!isPro && videos.length >= FREE_TIER_SOURCE_VIDEOS_LIMIT) {
        setError(
          `Limite atteinte : ${FREE_TIER_SOURCE_VIDEOS_LIMIT} vidéos maximum pour le plan gratuit. Passez Pro pour uploader plus de vidéos.`
        );
        return;
      }

      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving video for database user ID:', user.id);

      const { error } = await supabase.from('videos').insert({
        user_id: user.id, // Use database ID directly
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
      setError('Échec de la sauvegarde des informations de la vidéo');
    }
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  const updateVideoMetadata = async () => {
    if (!editingVideo.id || !editingVideo.title) return;

    setSavingMetadata(true);
    clearError(); // Clear any previous errors

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

      // No more success alert - user sees the updated video in the list
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Échec de la mise à jour des métadonnées');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleVideoPress = (video: VideoType) => {
    clearError(); // Clear errors on interaction
    setPlayingVideoId(null); // Stop any playing video
    router.push(`/video-details/${video.id}`);
  };

  const handlePlayToggle = (videoId: string) => {
    clearError(); // Clear errors on interaction
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

  // Check if user can upload more videos
  const canUploadMore = isPro || videos.length < FREE_TIER_SOURCE_VIDEOS_LIMIT;

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
        {revenueCatReady && !isPro && (
          <Text style={styles.limitText}>
            {videos.length}/{FREE_TIER_SOURCE_VIDEOS_LIMIT} vidéos (Plan gratuit)
          </Text>
        )}
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

        {/* Free tier limit warning */}
        {!isPro && !canUploadMore && (
          <View style={styles.limitContainer}>
            <Crown size={20} color="#FFD700" />
            <View style={styles.limitTextContainer}>
              <Text style={styles.limitTitle}>
                Limite de vidéos sources atteinte
              </Text>
              <Text style={styles.limitDescription}>
                Vous avez atteint la limite de {FREE_TIER_SOURCE_VIDEOS_LIMIT} vidéos sources du plan gratuit. 
                Passez Pro pour uploader plus de vidéos.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.uploadSection}>
          {canUploadMore ? (
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadStart={clearError} // Clear errors when upload starts
            />
          ) : (
            <View style={styles.uploadDisabled}>
              <VideoIcon size={32} color="#555" />
              <Text style={styles.uploadDisabledText}>
                Limite de vidéos sources atteinte
              </Text>
              <Text style={styles.uploadDisabledSubtext}>
                Supprimez une vidéo ou passez Pro pour continuer
              </Text>
            </View>
          )}

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
                onChangeText={(text) => {
                  clearError(); // Clear errors on input
                  setEditingVideo((prev) => ({ ...prev, title: text }));
                }}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={editingVideo.description}
                onChangeText={(text) => {
                  clearError(); // Clear errors on input
                  setEditingVideo((prev) => ({ ...prev, description: text }));
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (séparés par des virgules)"
                placeholderTextColor="#666"
                value={editingVideo.tags}
                onChangeText={(text) => {
                  clearError(); // Clear errors on input
                  setEditingVideo((prev) => ({ ...prev, tags: text }));
                }}
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    clearError(); // Clear errors on interaction
                    setEditingVideo({
                      id: null,
                      title: '',
                      description: '',
                      tags: '',
                    });
                  }}
                >
                  <Text style={styles.skipButtonText}>
                    Ignorer pour l&apos;instant
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (!editingVideo.title || savingMetadata) && styles.buttonDisabled,
                  ]}
                  onPress={updateVideoMetadata}
                  disabled={!editingVideo.title || savingMetadata}
                >
                  {savingMetadata ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sauvegarder</Text>
                  )}
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
            videos.map((video, index) => {
              // Debug: Log video data structure to diagnose text rendering issue
              console.log(`🔍 Video ${index} data:`, {
                id: video.id,
                title: video.title,
                description: video.description,
                tags: video.tags,
                tagsType: typeof video.tags,
                tagsIsArray: Array.isArray(video.tags),
              });

              return (
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
              );
            })
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
  limitText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
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
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2D1A00',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  limitTextContainer: {
    flex: 1,
  },
  limitTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  limitDescription: {
    color: '#FFA500',
    fontSize: 14,
    lineHeight: 20,
  },
  uploadSection: {
    gap: 20,
  },
  uploadDisabled: {
    width: '100%',
    height: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
    gap: 8,
  },
  uploadDisabledText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadDisabledSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
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
    minWidth: 120,
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
