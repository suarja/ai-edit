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
import VideoAnalysisProgress from '@/components/VideoAnalysisProgress';
import VideoMetadataEditor from '@/components/VideoMetadataEditor';
import { VideoType } from '@/types/video';
import { VideoAnalysisData } from '@/types/videoAnalysis';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useRevenueCat } from '@/providers/RevenueCat';
import { SupportService } from '@/lib/services/support/supportService';
import { useAuth } from '@clerk/clerk-expo';

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
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [showSupportButton, setShowSupportButton] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [hasAnalysisData, setHasAnalysisData] = useState(false);

  // Use the same pattern as settings.tsx and videos.tsx
  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();

  // Get subscription info for free tier limits
  const { isPro, isReady: revenueCatReady } = useRevenueCat();

  // Constants for free tier limits
  const FREE_TIER_SOURCE_VIDEOS_LIMIT = 30;

  // Reset error when user interacts with the app
  const clearError = useCallback(() => {
    if (error) {
      setError(null);
    }
  }, [error]);

  const { getToken } = useAuth();

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
        router.replace('/(auth)/sign-in');
        return;
      }

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

      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Échec du chargement des vidéos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (data: {
    videoStoragePath: string;
    url: string;
    videoDuration: number;
  }): Promise<string> => {
    try {
      clearError();

      if (!isPro && videos.length >= FREE_TIER_SOURCE_VIDEOS_LIMIT) {
        setError(
          `Limite atteinte : ${FREE_TIER_SOURCE_VIDEOS_LIMIT} vidéos maximum pour le plan gratuit. Passez Pro pour uploader plus de vidéos.`
        );
        throw new Error('Free tier limit reached');
      }

      const user = await fetchUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert with returning option to get the inserted row
      const { error, data: videoData } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: '',
          description: '',
          tags: [],
          upload_url: data.url,
          storage_path: data.videoStoragePath,
          duration_seconds: data.videoDuration,
          analysis_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      if (!videoData) {
        throw new Error('No video data returned after insertion');
      }

      await fetchVideos();
      console.log('🔍 Métadonnées enregistrées avec succès:', {
        id: videoData.id,
      });

      // Store video ID but don't set editing state yet
      setCurrentVideoId(videoData.id);

      // Return the video ID for the uploader component
      return videoData.id;
    } catch (error) {
      console.error('Error saving video data:', error);
      setError('Échec de la sauvegarde des informations de la vidéo');
      throw error; // Re-throw to prevent upload continuation
    }
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  const handleAnalysisComplete = async (
    data: VideoAnalysisData | null,
    videoId: string,
    manualEditRequired: boolean
  ) => {
    try {
      if (manualEditRequired || !data) {
        console.log('📹 Édition manuelle requise pour la vidéo:', videoId);

        // Marquer le statut comme 'failed' (pas d'analyse disponible) et ouvrir l'éditeur
        const { error } = await supabase
          .from('videos')
          .update({
            analysis_status: 'failed',
            analysis_data: null,
          })
          .eq('id', videoId);

        if (error) {
          console.error('Error updating video for manual edit:', error);
          throw error;
        }

        // Ouvrir l'éditeur avec des champs vides, pas d'analyse à rejeter
        setEditingVideo({
          id: videoId,
          title: '',
          description: '',
          tags: '',
        });
        setEditingVideoId(videoId);
        setHasAnalysisData(false); // Pas d'analyse à rejeter
      } else {
        console.log('Updating analysis for video:', videoId, {
          title: data.title,
          description: data.description,
          tags: data.tags,
        });

        // Sauvegarder l'analyse et ouvrir l'éditeur pré-rempli
        const { error } = await supabase
          .from('videos')
          .update({
            analysis_status: 'completed',
            analysis_data: data,
          })
          .eq('id', videoId);

        if (error) {
          console.error('Error updating video analysis:', error);
          throw error;
        }

        // Pré-remplir l'éditeur avec les données d'analyse
        setEditingVideo({
          id: videoId,
          title: data.title || '',
          description: data.description || '',
          tags: data.tags?.join(', ') || '',
        });
        setEditingVideoId(videoId);
        setHasAnalysisData(true); // Il y a une analyse à rejeter
      }

      // Refresh videos list to show updated status
      await fetchVideos();
    } catch (error) {
      console.error('Error saving analysis results:', error);
      setError("Échec de la sauvegarde des résultats d'analyse");
    }
  };

  // Simplifier la fonction de rejet d'analyse
  const rejectAnalysis = async () => {
    if (!editingVideoId) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          analysis_status: 'failed', // Utiliser 'failed' au lieu de 'rejected'
          analysis_data: null,
        })
        .eq('id', editingVideoId);

      if (error) throw error;

      // Reset editing state avec champs vides
      setEditingVideo({
        id: editingVideoId,
        title: '',
        description: '',
        tags: '',
      });

      await fetchVideos();
    } catch (error) {
      console.error('Error rejecting analysis:', error);
      setError("Échec du rejet de l'analyse");
    }
  };

  // Modifier la fonction updateVideoMetadata pour valider l'analyse
  const updateVideoMetadata = async () => {
    if (!editingVideo.id || !editingVideo.title || !editingVideo.description) {
      Alert.alert('Erreur', 'Le titre et la description sont requis');
      return;
    }

    console.log('🔍 Métadonnées à enregistrer:', {
      id: editingVideo.id,
      title: editingVideo.title,
      description: editingVideo.description,
      tags: editingVideo.tags,
    });
    setSavingMetadata(true);
    clearError();

    try {
      const tagsArray = editingVideo.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      if (tagsArray.length === 0) {
        Alert.alert('Erreur', 'Au moins un tag est requis');
        setSavingMetadata(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: editingVideo.title,
          description: editingVideo.description,
          tags: tagsArray,
          analysis_status: 'completed', // Marquer comme complété après validation
        })
        .eq('id', editingVideo.id);

      if (updateError) throw updateError;

      console.log('🔍 Métadonnées enregistrées avec succès:', {
        id: editingVideo.id,
      });

      // Reset editing state
      setEditingVideoId(null);
      setEditingVideo({
        id: null,
        title: '',
        description: '',
        tags: '',
      });
      setCurrentVideoId(null);
      await fetchVideos();
      console.log('🔍 Métadonnées enregistrées avec succès');
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

  // Add new function to handle support contact

  const handleError = async (
    error: Error | string,
    context?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;

    // Nettoyer les erreurs précédentes
    clearError();

    // Formater le message d'erreur pour l'utilisateur
    let userMessage = 'Une erreur est survenue';
    if (errorMessage.includes('quota')) {
      userMessage =
        'Limite d&apos;analyse quotidienne atteinte. Réessayez demain ou passez au plan Pro.';
    } else if (errorMessage.includes('trop volumineuse')) {
      userMessage = 'La vidéo est trop volumineuse (max 100MB)';
    } else if (
      errorMessage.includes('format') ||
      errorMessage.includes('corrompu')
    ) {
      userMessage =
        'Format de vidéo non supporté ou fichier corrompu. Essayez avec une autre vidéo.';
    } else {
      userMessage =
        'Échec de l&apos;analyse. Vous pouvez remplir les informations manuellement.';
      setShowSupportButton(true);
    }

    setError(userMessage);

    // Toujours envoyer un rapport pour les erreurs d'analyse
    try {
      const token = await getToken();
      if (token) {
        await SupportService.reportIssue({
          jobId: 'video-analysis-error',
          errorMessage: errorMessage,
          token,
          context: {
            ...context,
            videosCount: videos.length,
            isPro,
            lastAction: 'video_analysis',
          },
        });
      }
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
        {revenueCatReady && !isPro && (
          <View style={styles.planInfoContainer}>
            <Text style={styles.planInfoText}>
              {videos.length}/{FREE_TIER_SOURCE_VIDEOS_LIMIT} vidéos (Plan
              gratuit)
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorHeader}>
              <AlertCircle size={20} color="#ef4444" />
              <Text style={styles.errorTitle}>Erreur</Text>
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={async () => {
                  clearError();
                  setShowSupportButton(false);
                  setEditingVideo({
                    id: editingVideo.id,
                    title: '',
                    description: '',
                    tags: '',
                  });
                  await fetchVideos();
                }}
              >
                <Text style={styles.errorButtonText}>Compris</Text>
              </TouchableOpacity>
            </View>
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
                Vous avez atteint la limite de {FREE_TIER_SOURCE_VIDEOS_LIMIT}{' '}
                vidéos sources du plan gratuit. Passez Pro pour uploader plus de
                vidéos.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.uploadSection}>
          {/* VideoUploader - n'afficher que si pas d'édition et peut uploader */}
          {!editingVideo.id && canUploadMore && (
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadStart={clearError}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleError}
              onManualEdit={() => {
                console.log(
                  '🔍 Manual edit requested for video:',
                  currentVideoId
                );
                if (currentVideoId) {
                  setEditingVideo({
                    id: currentVideoId,
                    title: '',
                    description: '',
                    tags: '',
                  });
                  setEditingVideoId(currentVideoId);
                  setHasAnalysisData(false); // Édition manuelle, pas d'analyse
                }
              }}
            />
          )}

          {/* Si limite atteinte, afficher le message */}
     

          {/* Metadata Editor */}
          {editingVideo.id && (
            <View style={styles.metadataEditorContainer}>
              <Text style={styles.metadataTitle}>
                Éditer les informations de la vidéo
              </Text>
              <View style={styles.metadataInputContainer}>
                <Text style={styles.metadataInputLabel}>Titre *</Text>
                <TextInput
                  style={[
                    styles.metadataInput,
                    !editingVideo.title && styles.inputError,
                  ]}
                  placeholder="Titre de la vidéo"
                  placeholderTextColor="#666"
                  value={editingVideo.title}
                  onChangeText={(text) =>
                    setEditingVideo((prev) => ({ ...prev, title: text }))
                  }
                />
              </View>
              <View style={styles.metadataInputContainer}>
                <Text style={styles.metadataInputLabel}>Description *</Text>
                <TextInput
                  style={[
                    styles.metadataTextArea,
                    !editingVideo.description && styles.inputError,
                  ]}
                  placeholder="Description de la vidéo"
                  placeholderTextColor="#666"
                  value={editingVideo.description}
                  onChangeText={(text) =>
                    setEditingVideo((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.metadataInputContainer}>
                <Text style={styles.metadataInputLabel}>Tags *</Text>
                <TextInput
                  style={[
                    styles.metadataInput,
                    !editingVideo.tags && styles.inputError,
                  ]}
                  placeholder="tag1, tag2, tag3..."
                  placeholderTextColor="#666"
                  value={editingVideo.tags}
                  onChangeText={(text) =>
                    setEditingVideo((prev) => ({ ...prev, tags: text }))
                  }
                />
                <Text style={styles.helperText}>
                  Séparez les tags par des virgules. Au moins un tag est requis.
                </Text>
              </View>

              {/* Section pour les boutons d'analyse - seulement si il y a des données d'analyse */}
              {hasAnalysisData && (
                <View style={styles.analysisActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={rejectAnalysis}
                  >
                    <Text style={styles.rejectButtonText}>
                      Rejeter l&apos;analyse
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.analysisHelperText}>
                    Rejeter l&apos;analyse supprimera les suggestions
                    automatiques
                  </Text>
                </View>
              )}

              <View style={styles.metadataActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditingVideo({
                      id: null,
                      title: '',
                      description: '',
                      tags: '',
                    });
                    setEditingVideoId(null);
                    setCurrentVideoId(null);
                    clearError();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!editingVideo.title ||
                      !editingVideo.description ||
                      !editingVideo.tags ||
                      savingMetadata) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={async () => {
                    if (
                      !editingVideo.title ||
                      !editingVideo.description ||
                      !editingVideo.tags
                    ) {
                      Alert.alert('Erreur', 'Tous les champs sont requis');
                      return;
                    }
                    await updateVideoMetadata();
                  }}
                  disabled={
                    !editingVideo.title ||
                    !editingVideo.description ||
                    !editingVideo.tags ||
                    savingMetadata
                  }
                >
                  {savingMetadata ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      Valider et Enregistrer
                    </Text>
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
  planInfoContainer: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  planInfoText: {
    color: '#888',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  supportButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    opacity: 0.5,
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
  metadataEditorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  metadataTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  metadataInputContainer: {
    gap: 8,
  },
  metadataInputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  metadataInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  metadataTextArea: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  metadataActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  analysisActions: {
    marginBottom: 16,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisHelperText: {
    color: '#888',
    fontSize: 12,
  },
});
