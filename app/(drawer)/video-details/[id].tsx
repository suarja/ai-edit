import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';

import VideoPlayer from '@/components/VideoPlayer';
import VideoDetails from '@/components/VideoDetails';
import VideoActionButtons from '@/components/VideoActionButtons';
import VideoEditForm from '@/components/VideoEditForm';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { UserId, VideoId, VideoType } from '@/lib/types/video.types';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export default function UploadedVideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use Clerk authentication instead of Supabase
  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  const { getToken } = useAuth();

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
        router.replace('/(auth)/sign-in');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Use database ID directly
        .single();

      if (fetchError) throw fetchError;

      // Format as UploadedVideoType
      const formattedVideo: VideoType = {
        id: data.id as VideoId,
        title: data.title || '',
        description: data.description || '',
        tags: data.tags || [],
        upload_url: data.upload_url || '',
        duration_seconds: data.duration_seconds || 0,
        created_at: data.created_at || '',
        user_id: data.user_id as UserId,
        updated_at: data.created_at || '',
      };

      setVideo(formattedVideo);
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
              setLoading(true);
              // Get authentication token
              const clerkToken = await getToken();
              if (!clerkToken) {
                Alert.alert('Error', 'Authentication required');
                return;
              }

              // Call the new video deletion endpoint
              const response = await fetch(API_ENDPOINTS.VIDEO_DELETE(), {
                method: 'DELETE',
                headers: API_HEADERS.CLERK_AUTH(clerkToken),
                body: JSON.stringify({
                  videoId: video?.id,
                }),
              });

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to delete video');
              }

              console.log('✅ Video deleted successfully:', result.data);
              router.back();
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert(
                'Error',
                'Failed to delete video completely. Please try again.'
              );
            } finally {
              setLoading(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AnalysisHeader
          title="Détails de la vidéo"
          showBackButton
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing && video) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AnalysisHeader
          title="Modifier la vidéo"
          showBackButton
          onBack={handleCancelEdit}
        />
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
      <AnalysisHeader
        title="Détails de la vidéo"
        showBackButton
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <VideoPlayer video={video} />
          <VideoDetails video={video} error={error} />

          <VideoActionButtons
            video={video}
            layout="row"
            showEdit={true}
            showDelete={true}
            showCopyLink={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 16,
  },
  editFormScroll: {
    flex: 1,
  },
  editForm: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  // Remove unused styles since we're using VideoEditForm component
  // which has its own styles
});
