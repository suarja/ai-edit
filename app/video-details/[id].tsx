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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
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
} from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { VideoType } from '@/types/video';

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    if (id) {
      fetchVideoDetails();
    }
  }, [id]);

  const fetchVideoDetails = async () => {
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
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setVideo(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        tags: data.tags?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error fetching video:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la vidéo');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!video || !editForm.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          tags: editForm.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        })
        .eq('id', video.id);

      if (error) throw error;

      // Update local state
      setVideo({
        ...video,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        tags: editForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });

      setIsEditing(false);
      Alert.alert('Succès', 'Vidéo mise à jour avec succès');
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la vidéo');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la vidéo',
      'Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', video?.id);

              if (error) throw error;

              Alert.alert('Succès', 'Vidéo supprimée avec succès');
              router.back();
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la vidéo');
            }
          },
        },
      ]
    );
  };

  const handleDownload = async () => {
    if (video?.upload_url) {
      try {
        await Linking.openURL(video.upload_url);
      } catch (error) {
        Alert.alert('Erreur', "Impossible d'ouvrir le lien de téléchargement");
      }
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vidéo non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la vidéo</Text>
        <View style={styles.headerActions}>
          {!isEditing && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit3 size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: video.upload_url }}
            style={styles.video}
            shouldPlay={false}
            isLooping={false}
            isMuted={false}
            resizeMode={ResizeMode.RESIZE_MODE_CONTAIN}
            useNativeControls={true}
          />
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.sectionTitle}>Modifier les informations</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Titre de la vidéo"
                placeholderTextColor="#666"
                value={editForm.title}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, title: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Description de la vidéo"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                value={editForm.description}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, description: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <TextInput
                style={styles.input}
                placeholder="Tags séparés par des virgules"
                placeholderTextColor="#666"
                value={editForm.tags}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, tags: text }))
                }
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditForm({
                    title: video.title || '',
                    description: video.description || '',
                    tags: video.tags?.join(', ') || '',
                  });
                }}
              >
                <X size={16} color="#888" />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !editForm.title.trim() && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={!editForm.title.trim()}
              >
                <Check size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoSection}>
            <Text style={styles.videoTitle}>{video.title}</Text>

            {video.description && (
              <Text style={styles.videoDescription}>{video.description}</Text>
            )}

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Clock size={16} color="#888" />
                <Text style={styles.metaText}>
                  {video.duration_seconds > 0
                    ? formatDuration(video.duration_seconds)
                    : 'Durée non spécifiée'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Créé le:</Text>
                <Text style={styles.metaText}>
                  {new Date(video.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {video.tags && video.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <View style={styles.tagHeader}>
                  <Tag size={16} color="#888" />
                  <Text style={styles.sectionTitle}>Tags</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {video.tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDownload}
          >
            <Download size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Télécharger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={copyVideoUrl}
          >
            <ExternalLink size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Copier l'URL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
            <Trash2 size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>Supprimer</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    height: 250,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 20,
    gap: 16,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 30,
  },
  videoDescription: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
  },
  metaInfo: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    color: '#888',
    fontSize: 14,
  },
  metaText: {
    color: '#ccc',
    fontSize: 14,
  },
  tagsSection: {
    gap: 12,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
  },
  editForm: {
    padding: 20,
    gap: 20,
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
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
