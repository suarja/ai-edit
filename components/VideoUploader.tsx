import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useVideoSelector } from '@/components/hooks/useVideoSelector';
import { useVideoUpload } from '@/components/hooks/useVideoUpload';
import { useOnDeviceVideoAnalysis } from '@/components/hooks/useOnDeviceVideoAnalysis';
import { UseSourceVideos } from '@/components/hooks/useSourceVideos';

interface VideoUploaderProps {
  onUploadComplete: UseSourceVideos['actions']['handleUploadComplete'];
  onUploadError: UseSourceVideos['actions']['handleUploadError'];
  onUploadStart: UseSourceVideos['actions']['clearError'];
  onAnalysisComplete: UseSourceVideos['actions']['handleAnalysisComplete'];
  onAnalysisError: UseSourceVideos['actions']['handleError'];
  onManualEdit: () => void;
  getPresignedUrl: UseSourceVideos['actions']['getPresignedUrl'];
}

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onAnalysisComplete,
  onAnalysisError,
  onManualEdit,
  getPresignedUrl,
}: VideoUploaderProps) {
  const { selectVideo } = useVideoSelector();
  const { uploadToS3, progress } = useVideoUpload();
  const { analyze } = useOnDeviceVideoAnalysis();

  const [localState, setLocalState] = React.useState<
    'idle' | 'uploading' | 'analyzing'
  >('idle');


  const handleSelectAndUpload = async () => {
    try {
      setLocalState('uploading');
      if (onUploadStart) onUploadStart();
      const asset = await selectVideo();
      // getPresignedUrl doit être fourni par le parent ou via props/context
      const { publicUrl, s3FileName } = await uploadToS3(
        asset,
        getPresignedUrl
      );
      console.log('s3FileName', s3FileName);
      let videoId: string | null = null;
      if (onUploadComplete) {
        videoId = await onUploadComplete({
          videoStoragePath: s3FileName,
          url: publicUrl,
          videoDuration: Math.floor((asset.duration || 0) / 1000),
        });
        console.log('videoId', videoId);
      }
      setLocalState('analyzing');
      // Analyse on-device
      const analysisResult = await analyze(asset.uri);
      if (onAnalysisComplete) {
        if (videoId) {
          onAnalysisComplete(analysisResult.analysisData, videoId, true);
          setLocalState('idle');
          console.log('onAnalysisComplete', videoId);
        } else {
          onAnalysisError(new Error('No video ID found'));
        }
      }
    } catch (err) {
      setLocalState('idle');
      if (onUploadError) onUploadError(err as Error);
    }
  };

  return (
    <View style={styles.container}>
      {localState === 'idle' && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSelectAndUpload}
        >
          <Text style={styles.uploadButtonText}>Uploader une vidéo</Text>
        </TouchableOpacity>
      )}
      {localState === 'uploading' && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.statusText}>Upload en cours... {progress}%</Text>
        </View>
      )}
      {localState === 'analyzing' && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.statusText}>Analyse on-device en cours...</Text>
          <TouchableOpacity style={styles.skipButton} onPress={onManualEdit}>
            <Text style={styles.skipButtonText}>
              Ignorer l&apos;analyse et remplir manuellement
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
});
