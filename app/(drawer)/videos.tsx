import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { CircleAlert as AlertCircle, Plus } from 'lucide-react-native';
import GeneratedVideoCard from '@/components/GeneratedVideoCard';
import EmptyGeneratedVideos from '@/components/EmptyGeneratedVideos';
import VideoHeader from '@/components/VideoHeader';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';

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
    generated_script: string;
    output_language: string;
  };
};

// Transform VideoRequest to match expected VideoCard format
type DisplayVideo = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  tags?: string[];
  script_id: string;
};

export default function GeneratedVideosScreen() {
  const [videos, setVideos] = useState<VideoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use the same pattern as settings.tsx
  const { fetchUser, clerkUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  const { getToken } = useAuth();

  const fetchVideos = async () => {
    console.log('fetching videos');
    try {
      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        console.log('No database user found');
        router.replace('/(auth)/sign-in');
        return;
      }

      console.log('Fetching videos for database user ID:', user.id);

      // Use the database ID directly - no need to lookup again!
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
          script:scripts!inner(
            id,
            raw_prompt,
            generated_script,
            output_language
          )
        `
        )
        .eq('user_id', user.id) // Use database ID directly
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data as unknown as VideoRequest[]);

      // Check status for rendering videos
      const renderingVideos =
        (data as unknown as VideoRequest[])?.filter(
          (v: VideoRequest) => v.render_status === 'rendering'
        ) || [];

      for (const video of renderingVideos) {
        console.log('checking video status', video.id);
        await checkVideoStatus(video.id as string);
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
      // Get Clerk token for API authentication
      const clerkToken = await getToken();

      if (!clerkToken) {
        console.error('No Clerk token available for status check');
        return;
      }

      const url = API_ENDPOINTS.VIDEO_STATUS(videoId);
      console.log('url', url);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkToken}`,
        },
      });

      if (!response.ok) {
        console.error('Status check failed:', await response.text());
        throw new Error('Failed to check status');
      }

      const data: VideoRequest = (await response.json()).data;

      console.log('data', data);

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

  // Transform video requests to display format
  const transformVideoForDisplay = (video: VideoRequest): DisplayVideo => {
    const prompt = video.script?.raw_prompt || 'Vidéo sans titre';

    // Create a title from the prompt (first 50 characters)
    const title = prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt;

    // Create a description with status and language info
    const statusMap: Record<string, string> = {
      queued: "En file d'attente",
      rendering: 'En cours de génération',
      done: 'Prêt',
      error: 'Erreur',
    };
    const statusText = statusMap[video.render_status] || video.render_status;

    const description = `${statusText}${
      video.script?.output_language
        ? ` • ${video.script.output_language.toUpperCase()}`
        : ''
    }`;

    return {
      id: video.id,
      title,
      description,
      created_at: video.created_at,
      render_status: video.render_status,
      render_url: video.render_url,
      script_id: video.script_id,
      tags: video.script?.output_language
        ? [video.script.output_language]
        : undefined,
    };
  };

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchVideos();
    }
  }, [clerkLoaded, isSignedIn]);

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
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des vidéos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
              video={transformVideoForDisplay(item)}
              onPress={() => handleVideoPress(item.id)}
              onDownload={() => handleDownload(item)}
              onMoreOptions={() => handleMoreOptions(item)}
            />
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateVideo}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
