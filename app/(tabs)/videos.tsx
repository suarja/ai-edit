import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { CircleAlert as AlertCircle, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GeneratedVideoCard from '@/components/GeneratedVideoCard';
import EmptyGeneratedVideos from '@/components/EmptyGeneratedVideos';
import { env } from '@/lib/config/env';

type VideoRequest = {
  id: string;
  script_id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_id?: string;
  created_at: string;
  script?: {
    id: string;
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
          script:script_id (
            id,
            raw_prompt
          )
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
      setError('Échec du chargement des vidéos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkVideoStatus = async (videoId: string) => {
    try {
      const response = await fetch(
        `${env.SERVER_URL}/api/videos/status/${videoId}`
      );

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        throw new Error('Failed to check status');
      }

      const data: VideoRequest = await response.json();

      // Update video in state if status changed
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, ...data } : v))
      );

      // Continue polling if still rendering (every 30 seconds)
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
    setError(null);
    fetchVideos();
  }, []);

  const handleVideoPress = (videoId: string) => {
    router.push(`/(tabs)/videos/${videoId}`);
  };

  const handleDownload = async (video: VideoRequest) => {
    if (!video.render_url) {
      Alert.alert('Erreur', 'URL de téléchargement non disponible');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(video.render_url);
      if (supported) {
        await Linking.openURL(video.render_url);
      } else {
        Alert.alert('Erreur', "Impossible d'ouvrir le lien de téléchargement");
      }
    } catch (err) {
      console.error('Error opening download link:', err);
      Alert.alert('Erreur', 'Échec du téléchargement');
    }
  };

  const handleMoreOptions = (video: VideoRequest) => {
    const options = ['Voir les détails', 'Télécharger', 'Supprimer'];

    if (video.render_status !== 'done') {
      options.splice(1, 1); // Remove download option if not done
    }

    Alert.alert('Options', `Que souhaitez-vous faire avec cette vidéo ?`, [
      {
        text: 'Voir les détails',
        onPress: () => handleVideoPress(video.id),
      },
      ...(video.render_status === 'done'
        ? [
            {
              text: 'Télécharger',
              onPress: () => handleDownload(video),
            },
          ]
        : []),
      {
        text: 'Supprimer',
        style: 'destructive' as const,
        onPress: () => handleDeleteVideo(video.id),
      },
      {
        text: 'Annuler',
        style: 'cancel' as const,
      },
    ]);
  };

  const handleDeleteVideo = (videoId: string) => {
    Alert.alert(
      'Supprimer la vidéo',
      'Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('video_requests')
                .delete()
                .eq('id', videoId);

              if (error) throw error;

              setVideos((prev) => prev.filter((v) => v.id !== videoId));
              Alert.alert('Succès', 'Vidéo supprimée avec succès');
            } catch (err) {
              console.error('Error deleting video:', err);
              Alert.alert('Erreur', 'Échec de la suppression');
            }
          },
        },
      ]
    );
  };

  const handleCreateVideo = () => {
    router.push('/(tabs)/request-video');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des vidéos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Vidéos Générées</Text>
            <Text style={styles.subtitle}>
              {videos.length > 0
                ? `${videos.length} vidéo${videos.length > 1 ? 's' : ''} créée${
                    videos.length > 1 ? 's' : ''
                  }`
                : 'Aucune vidéo pour le moment'}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Sparkles size={24} color="#007AFF" />
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {videos.length === 0 ? (
        <EmptyGeneratedVideos onCreateVideo={handleCreateVideo} />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
              title="Actualisation..."
              titleColor="#888"
            />
          }
          renderItem={({ item }) => (
            <GeneratedVideoCard
              video={item}
              onPress={() => handleVideoPress(item.id)}
              onDownload={() => handleDownload(item)}
              onMoreOptions={() => handleMoreOptions(item)}
            />
          )}
        />
      )}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
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
  },
});
