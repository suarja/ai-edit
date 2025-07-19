import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoUploader from '@/components/VideoUploader';
import VideoMetadataEditor from '@/components/VideoMetadataEditor';
import ErrorDisplay from '@/components/ErrorDisplay';
import VideoList from '@/components/VideoList';

import { useSourceVideos } from '@/components/hooks/useSourceVideos';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useGetUser } from '@/components/hooks/useGetUser';
import { sourceVideoStyle } from '@/lib/utils/styles/sourceVideoStyles';

export default function SourceVideosScreen() {
  const {
    videos,
    loading,
    error,
    refreshing,
    playingVideoId,
    loadingVideoIds,
    errorVideoIds,
    visibleVideoIds,
    editingVideo,
    editingVideoId,
    savingMetadata,
    currentVideoId,
    hasAnalysisData,
    viewabilityConfigCallbackPairs,
    fetchVideos,
    onRefresh,
    handleUploadComplete,
    handleUploadError,
    handleAnalysisComplete,
    rejectAnalysis,
    updateVideoMetadata,
    handleVideoPress,
    handlePlayToggle,
    handleVideoLoadStart,
    handleVideoLoad,
    handleVideoError,
    handleError,
    getPresignedUrl,
    canUploadMore,
    setEditingVideo,
    setEditingVideoId,
    setCurrentVideoId,
    clearError,
    setShowSupportButton,
  } = useSourceVideos();

  // Use the same pattern as settings.tsx and videos.tsx
  const { clerkLoaded, isSignedIn } = useGetUser();

  // Get subscription info for free tier limits
  const { currentPlan, isReady: revenueCatReady, userUsage } = useRevenueCat();

  React.useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      fetchVideos();
    }
  }, [clerkLoaded, isSignedIn]);

  if (loading) {
    return (
      <SafeAreaView style={sourceVideoStyle.container} edges={[]}>
        <View style={sourceVideoStyle.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sourceVideoStyle.container} edges={[]}>
      <View style={sourceVideoStyle.content}>
        {revenueCatReady && userUsage && currentPlan === 'free' && (
          <View style={sourceVideoStyle.planInfoContainer}>
            <Text style={sourceVideoStyle.planInfoText}>
              {userUsage.source_videos_used}/{userUsage.source_videos_limit}{' '}
              vidéos sources (Plan Gratuit)
            </Text>
          </View>
        )}

        {error && (
          <ErrorDisplay
            message={error}
            onAcknowledge={async () => {
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
          />
        )}

        {/* Free tier limit warning */}
        {revenueCatReady && !canUploadMore && (
          <View style={sourceVideoStyle.limitContainer}>
            <Crown size={20} color="#FFD700" />
            <View style={sourceVideoStyle.limitTextContainer}>
              <Text style={sourceVideoStyle.limitTitle}>
                Limite de vidéos sources atteinte
              </Text>
              <Text style={sourceVideoStyle.limitDescription}>
                Vous avez atteint la limite de{' '}
                {userUsage?.source_videos_limit || 0} vidéos sources du plan
                gratuit. Passez Pro pour uploader plus de vidéos.
              </Text>
            </View>
          </View>
        )}

        <View style={sourceVideoStyle.uploadSection}>
          {/*
            Nouveau flow :
            - L'utilisateur clique sur "Uploader une vidéo" (VideoUploader)
            - Upload S3, puis analyse on-device
            - Après analyse (ou si ignorée), le formulaire d'édition metadata s'affiche toujours (pré-rempli si analyse OK)
          */}
          {!editingVideo.id && canUploadMore && (
            <VideoUploader
              getPresignedUrl={getPresignedUrl}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadStart={clearError}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleError}
              onManualEdit={() => {
                if (currentVideoId) {
                  setEditingVideo({
                    id: currentVideoId,
                    title: '',
                    description: '',
                    tags: '',
                  });
                  setEditingVideoId(currentVideoId);
                }
              }}
            />
          )}
        </View>

        {/* Metadata Editor Modal */}
        <Modal
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
          visible={!!editingVideo.id}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setEditingVideo({ id: null, title: '', description: '', tags: '' });
            setEditingVideoId(null);
            setCurrentVideoId(null);
            clearError();
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}
          >
            <SafeAreaView
              style={[
                sourceVideoStyle.metadataEditorContainer,
                { width: '90%', height: '70%' },
              ]}
              edges={['top', 'bottom']}
            >
              {/* Reuse existing style */}
              <VideoMetadataEditor
                videoId={editingVideo.id || ''}
                analysisData={
                  hasAnalysisData &&
                  typeof editingVideoId === 'string' &&
                  videos.find((v) => v.id === editingVideoId)?.analysis_data
                    ? videos.find((v) => v.id === editingVideoId)?.analysis_data
                    : undefined
                }
                onSave={async (metadata) => {
                  setEditingVideo((prev) => ({
                    ...prev,
                    title: metadata.title,
                    description: metadata.description,
                    tags: metadata.tags.join(', '),
                  }));
                  await updateVideoMetadata(metadata);
                }}
                onCancel={() => {
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
                isSaving={savingMetadata}
              />
              {hasAnalysisData && (
                <View style={sourceVideoStyle.analysisActions}>
                  <TouchableOpacity
                    style={sourceVideoStyle.rejectButton}
                    onPress={rejectAnalysis}
                  >
                    <Text style={sourceVideoStyle.rejectButtonText}>
                      Rejeter l&apos;analyse
                    </Text>
                  </TouchableOpacity>
                  <Text style={sourceVideoStyle.analysisHelperText}>
                    Rejeter l&apos;analyse supprimera les suggestions
                    automatiques
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </View>
        </Modal>

        <View style={sourceVideoStyle.videosList}>
          <Text style={sourceVideoStyle.sectionTitle}>Vos Vidéos</Text>
          <VideoList
            videos={videos}
            playingVideoId={playingVideoId}
            loadingVideoIds={loadingVideoIds}
            errorVideoIds={errorVideoIds}
            visibleVideoIds={visibleVideoIds}
            onVideoPress={handleVideoPress}
            onPlayToggle={handlePlayToggle}
            onLoadStart={handleVideoLoadStart}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
