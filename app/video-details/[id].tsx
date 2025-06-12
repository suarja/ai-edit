import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Download,
  ExternalLink,
  Check,
  X,
  Clock,
  Tag,
  Save,
  FileVideo,
} from 'lucide-react-native';
// TEMPORARILY DISABLED FOR ANDROID CRASH FIX
// import { useVideoPlayer, VideoView } from 'expo-video';
import { UploadedVideoType, VideoType, isUploadedVideo } from '@/types/video';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import VideoPlayer from '@/components/VideoPlayer';
import VideoDetailHeader from '@/components/VideoDetailHeader';
import VideoDetails from '@/components/VideoDetails';
import VideoActionButtons from '@/components/VideoActionButtons';

// VideoEditForm component for editing video metadata
function VideoEditForm({
  video,
  onSave,
  onCancel,
}: {
  video: UploadedVideoType;
  onSave: (data: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: video.title || '',
    description: video.description || '',
    tags: video.tags?.join(', ') || '',
  });

  const isValid = form.title.trim().length > 0;

  return (
    <ScrollView style={styles.editFormScroll}>
      <View style={styles.editForm}>
        <Text style={styles.sectionTitle}>Edit Video Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Video title"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, title: text }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Video description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, description: text }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="Tags separated by commas"
            placeholderTextColor="#666"
            value={form.tags}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, tags: text }))
            }
          />
        </View>

        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <X size={16} color="#888" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isValid && styles.buttonDisabled]}
            onPress={() => {
              if (isValid) {
                onSave({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  tags: form.tags
                    .split(',')
                    .map((tag: string) => tag.trim())
                    .filter(Boolean),
                });
              }
            }}
            disabled={!isValid}
          >
            <Check size={16} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default function UploadedVideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<UploadedVideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use Clerk authentication instead of Supabase
  const { fetchUser, clerkUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();

  // TEMPORARILY DISABLED FOR ANDROID CRASH FIX
  // const player = useVideoPlayer(
  //   video ? { uri: video.upload_url } : null,
  //   (player) => {
  //     player.muted = false;
  //   }
  // );

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      if (id) {
        fetchVideoDetails();
      }
    }
  }, [id, clerkLoaded, isSignedIn]);

  useEffect(() => {
    if (video) {
      // TEMPORARILY DISABLED FOR ANDROID CRASH FIX
      // player.replaceAsync({ uri: video.upload_url });
    }
  }, [video]);

  const fetchVideoDetails = async () => {
    try {
      setError(null);

      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        console.log('No database user found');
        router.replace('/(auth)/sign-in');
        return;
      }

      console.log('🔍 Fetching video details for database user ID:', user.id);

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Use database ID directly
        .single();

      if (fetchError) throw fetchError;

      // Format as UploadedVideoType
      const formattedVideo: UploadedVideoType = {
        id: data.id,
        type: 'uploaded',
        title: data.title || '',
        description: data.description || '',
        tags: data.tags || [],
        upload_url: data.upload_url,
        duration_seconds: data.duration_seconds,
        created_at: data.created_at,
        storage_path: data.storage_path,
        user_id: data.user_id,
      };

      setVideo(formattedVideo);
      console.log('✅ Video details fetched successfully');
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Unable to load video details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    if (!video) {
      Alert.alert('Error', 'No video data available');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: formData.title,
          description: formData.description,
          tags: formData.tags,
        })
        .eq('id', video.id);

      if (updateError) throw updateError;

      // Update local state
      setVideo({
        ...video,
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Video updated successfully');
      console.log('✅ Video metadata updated successfully');
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Failed to update video');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: deleteError } = await supabase
                .from('videos')
                .delete()
                .eq('id', video?.id);

              if (deleteError) throw deleteError;

              Alert.alert('Success', 'Video deleted successfully');
              console.log('✅ Video deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDownload = async () => {
    if (!video?.upload_url) {
      Alert.alert('Erreur', 'URL de la vidéo indisponible');
      return;
    }

    try {
      // Request permissions first (for Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'Impossible de sauvegarder la vidéo sans permission'
          );
          return;
        }
      }

      // Extract filename from URL
      const fileName =
        video.upload_url.split('/').pop() || `video-${Date.now()}.mp4`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Show download progress
      const downloadResumable = FileSystem.createDownloadResumable(
        video.upload_url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          // You could update a progress state here if you want to show a progress bar
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      Alert.alert('Téléchargement', 'Le téléchargement de la vidéo a commencé');

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        if (Platform.OS === 'ios') {
          // On iOS we can use the sharing API to save to camera roll
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(result.uri);
          } else {
            Alert.alert(
              'Téléchargement terminé',
              `Vidéo téléchargée avec succès à l'emplacement: ${result.uri}`
            );
          }
        } else if (Platform.OS === 'android') {
          // On Android, save to media library
          const asset = await MediaLibrary.createAssetAsync(result.uri);
          await MediaLibrary.createAlbumAsync('Vidéos', asset, false);

          Alert.alert(
            'Téléchargement terminé',
            'Vidéo téléchargée et sauvegardée dans votre galerie',
            [
              {
                text: 'Ouvrir',
                onPress: () =>
                  FileSystem.getContentUriAsync(result.uri).then(
                    (contentUri) => {
                      Linking.openURL(contentUri);
                    }
                  ),
              },
              { text: 'OK' },
            ]
          );
        } else {
          // Web or other platforms
          Alert.alert(
            'Téléchargement terminé',
            `Vidéo téléchargée avec succès à l'emplacement: ${result.uri}`
          );
        }
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      Alert.alert('Erreur', 'Impossible de télécharger la vidéo');
    }
  };

  const copyVideoUrl = async () => {
    if (video?.upload_url) {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(video.upload_url);
          Alert.alert('Succès', 'URL copiée dans le presse-papiers');
        } else {
          Alert.alert('URL de la vidéo', video.upload_url, [
            { text: 'Fermer', style: 'cancel' },
            {
              text: 'Ouvrir',
              onPress: () => Linking.openURL(video.upload_url),
            },
          ]);
        }
      } catch (error) {
        Alert.alert('Erreur', "Impossible de copier l'URL");
      }
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <VideoDetailHeader title="Video Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing && video) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <VideoDetailHeader title="Edit Video" />
        <VideoEditForm
          video={video}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <VideoDetailHeader title="Video Details" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <VideoPlayer video={video} />
        <VideoDetails video={video} error={error} />

        <VideoActionButtons
          video={video}
          layout="column"
          showEdit={true}
          showDelete={true}
          showCopyLink={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </ScrollView>
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
  editFormScroll: {
    flex: 1,
  },
  editForm: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
