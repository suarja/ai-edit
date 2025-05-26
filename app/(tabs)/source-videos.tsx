import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Upload, Plus, Video as VideoIcon, Tag, Clock, Trash2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { decode } from 'base64-arraybuffer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';

type VideoType = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upload_url: string;
  duration_seconds: number;
  created_at: string;
};

const SUPPORTED_VIDEO_FORMATS = {
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'm4v': 'video/mp4',
  'mov': 'video/quicktime',
  'qt': 'video/quicktime'
};

export default function SourceVideosScreen() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    video: string | null;
    title: string;
    description: string;
    tags: string;
  }>({
    video: null,
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
      const { data: { user } } = await supabase.auth.getUser();
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

  const getExtensionFromUri = (uri: string): string | null => {
    try {
      if (uri.startsWith('data:')) {
        const mime = uri.split(';')[0].split(':')[1];
        const ext = Object.entries(SUPPORTED_VIDEO_FORMATS).find(
          ([ext, mimeType]) => mimeType === mime
        )?.[0];
        return ext || null;
      } else if (uri.startsWith('file://') || uri.includes('/')) {
        const path = uri.split('?')[0];
        const match = path.match(/\.(\w+)$/);
        return match ? match[1].toLowerCase() : null;
      }
      return null;
    } catch (err) {
      console.warn('Failed to extract extension:', err);
      return null;
    }
  };

  const generateStoragePath = (userId: string, originalFileName: string, ext: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = originalFileName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return `videos/${userId}/${timestamp}-${sanitizedFileName}.${ext}`;
  };

  const uploadToStorage = async (uri: string, fileName: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ext = getExtensionFromUri(uri);
      if (!ext || !(ext in SUPPORTED_VIDEO_FORMATS)) {
        throw new Error('Unsupported video format');
      }

      const storagePath = generateStoragePath(user.id, fileName, ext);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64File = (await promise as string).split(',')[1];
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, decode(base64File), {
          contentType: SUPPORTED_VIDEO_FORMATS[ext as keyof typeof SUPPORTED_VIDEO_FORMATS],
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      return storagePath;
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Failed to upload video to storage');
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.video || !uploadForm.title) return;

    try {
      setUploading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const storagePath = await uploadToStorage(uploadForm.video, uploadForm.title);

      const { error: uploadError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: uploadForm.title,
          description: uploadForm.description,
          tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          storage_path: storagePath,
          duration_seconds: 0,
        });

      if (uploadError) throw uploadError;

      setUploadForm({
        video: null,
        title: '',
        description: '',
        tags: '',
      });
      await fetchVideos();
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const isVideoFormatSupported = (uri: string): boolean => {
    const ext = getExtensionFromUri(uri);
    return !!ext && ext in SUPPORTED_VIDEO_FORMATS;
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        const videoUri = result.assets[0].uri;

        if (!isVideoFormatSupported(videoUri)) {
          setError('Format vidéo non supporté. Utilisez MP4, WebM ou M4V.');
          return;
        }

        setUploadForm(prev => ({
          ...prev,
          video: videoUri,
        }));
        setError(null);
      }
    } catch (err) {
      console.error('Error picking video:', err);
      setError('Échec de la sélection de la vidéo');
    }
  };

  const deleteVideo = async (id: string, url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const fileName = url.split('/').pop();
      if (!fileName) throw new Error('URL de fichier invalide');

      const filePath = `${user.id}/${fileName}`;
      
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([filePath]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

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
          <TouchableOpacity style={styles.uploadArea} onPress={pickVideo}>
            {uploadForm.video ? (
              <Video
                source={{ uri: uploadForm.video }}
                style={styles.preview}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isMuted={true}
                useNativeControls={false}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Upload size={48} color="#fff" />
                <Text style={styles.uploadText}>Télécharger une Vidéo</Text>
                <Text style={styles.uploadSubtext}>Formats acceptés : MP4, WebM, M4V</Text>
              </View>
            )}
          </TouchableOpacity>

          {uploadForm.video && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Titre de la vidéo"
                placeholderTextColor="#666"
                value={uploadForm.title}
                onChangeText={(text) => setUploadForm(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={uploadForm.description}
                onChangeText={(text) => setUploadForm(prev => ({ ...prev, description: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (séparés par des virgules)"
                placeholderTextColor="#666"
                value={uploadForm.tags}
                onChangeText={(text) => setUploadForm(prev => ({ ...prev, tags: text }))}
              />

              <TouchableOpacity
                style={[styles.button, (!uploadForm.title || uploading) && styles.buttonDisabled]}
                onPress={handleUpload}
                disabled={!uploadForm.title || uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Plus size={24} color="#fff" />
                    <Text style={styles.buttonText}>Télécharger la Vidéo</Text>
                  </>
                )}
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
                  <Text style={styles.videoDescription}>{video.description}</Text>
                )}
                <View style={styles.videoMeta}>
                  {video.tags && video.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      <Tag size={14} color="#888" />
                      <Text style={styles.tagText}>{video.tags.join(', ')}</Text>
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
                onPress={() => deleteVideo(video.id, video.upload_url)}
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
  uploadArea: {
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
  },
  uploadSubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  preview: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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