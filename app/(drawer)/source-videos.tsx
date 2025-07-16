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

import { useSourceVideos } from '@/hooks/useSourceVideos';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { useRevenueCat } from '@/providers/RevenueCat';

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
  const { isPro, isReady: revenueCatReady, userUsage } = useRevenueCat();

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
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        {revenueCatReady && userUsage && !isPro && (
          <View style={styles.planInfoContainer}>
            <Text style={styles.planInfoText}>
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
          <View style={styles.limitContainer}>
            <Crown size={20} color="#FFD700" />
            <View style={styles.limitTextContainer}>
              <Text style={styles.limitTitle}>
                Limite de vidéos sources atteinte
              </Text>
              <Text style={styles.limitDescription}>
                Vous avez atteint la limite de{' '}
                {userUsage?.source_videos_limit || 0} vidéos sources du plan
                gratuit. Passez Pro pour uploader plus de vidéos.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.uploadSection}>
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
                styles.metadataEditorContainer,
                { width: '90%', height: '70%' },
              ]}
              edges={['top', 'bottom']}
            >
              {' '}
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
                  await updateVideoMetadata();
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
            </SafeAreaView>
          </View>
        </Modal>

        <View style={styles.videosList}>
          <Text style={styles.sectionTitle}>Vos Vidéos</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
