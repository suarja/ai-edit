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
  Modal,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  Video as VideoIcon,
  Tag,
  Clock,
  Trash2,
  CircleAlert as AlertCircle,
  Play,
  X,
  Download,
  FileVideo,
  ExternalLink,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
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

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Taille inconnue';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const openVideoDetails = (video: VideoType) => {
    setSelectedVideo(video);
  };

  const closeVideoDetails = () => {
    setSelectedVideo(null);
  };

  const downloadVideo = async (video: VideoType) => {
    try {
      await Linking.openURL(video.upload_url);
    } catch (error) {
      Alert.alert(
        'Erreur de téléchargement',
        "Impossible d'ouvrir le lien de téléchargement. Veuillez réessayer.",
        [{ text: 'OK' }]
      );
    }
  };

  const copyVideoUrl = async (video: VideoType) => {
    try {
      // For web, we can use the Clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(video.upload_url);
        Alert.alert('Succès', 'URL copiée dans le presse-papiers');
      } else {
        // Fallback: show the URL in an alert
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
              <View key={video.id} style={styles.videoItem}>
                <TouchableOpacity
                  style={styles.videoPreview}
                  onPress={() => openVideoDetails(video)}
                >
                  <View style={styles.fileIcon}>
                    <FileVideo size={32} color="#007AFF" />
                  </View>
                  {video.duration_seconds > 0 && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>
                        {formatDuration(video.duration_seconds)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.downloadIcon}>
                    <Download size={16} color="#fff" />
                  </View>
                </TouchableOpacity>

                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title || 'Vidéo sans titre'}
                  </Text>
                  {video.description && (
                    <Text style={styles.videoDescription} numberOfLines={2}>
                      {video.description}
                    </Text>
                  )}
                  <View style={styles.videoMeta}>
                    {video.tags && video.tags.length > 0 && (
                      <View style={styles.tagContainer}>
                        <Tag size={14} color="#888" />
                        <Text style={styles.tagText} numberOfLines={1}>
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
                  onPress={() =>
                    deleteVideo(video.id, video.storage_path || '')
                  }
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Video Preview Modal */}
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeVideoDetails}
      >
        {selectedVideo && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedVideo.title || 'Vidéo sans titre'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeVideoDetails}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.filePreview}>
                <FileVideo size={64} color="#007AFF" />
                <Text style={styles.fileTypeText}>Fichier Vidéo</Text>
                <Text style={styles.fileUrlText} numberOfLines={1}>
                  {selectedVideo.upload_url}
                </Text>
              </View>

              <View style={styles.videoDetailsSection}>
                <Text style={styles.videoDetailsTitle}>Informations</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Durée:</Text>
                  <Text style={styles.infoValue}>
                    {selectedVideo.duration_seconds > 0
                      ? formatDuration(selectedVideo.duration_seconds)
                      : 'Non spécifiée'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Créé le:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedVideo.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {selectedVideo.description && (
                <View style={styles.videoDetailsSection}>
                  <Text style={styles.videoDetailsTitle}>Description</Text>
                  <Text style={styles.videoDetailsText}>
                    {selectedVideo.description}
                  </Text>
                </View>
              )}

              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <View style={styles.videoDetailsSection}>
                  <Text style={styles.videoDetailsTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedVideo.tags.map((tag, index) => (
                      <View key={index} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => downloadVideo(selectedVideo)}
                >
                  <Download size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Télécharger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => copyVideoUrl(selectedVideo)}
                >
                  <ExternalLink size={20} color="#007AFF" />
                  <Text style={styles.secondaryButtonText}>Copier l'URL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      </Modal>
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
    width: 120,
    height: 80,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
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
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fileTypeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  fileUrlText: {
    color: '#888',
    fontSize: 14,
  },
  videoDetailsSection: {
    marginBottom: 20,
  },
  videoDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  videoDetailsText: {
    color: '#888',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagChip: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 4,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fileIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 4,
  },
});
