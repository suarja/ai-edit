import React, { useState } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUploadThing } from '@/lib/uploadthing';
import * as ImagePicker from 'expo-image-picker';
import { openSettings } from 'expo-linking';
import { Video as VideoIcon } from 'lucide-react-native';
import { MediaTypeOptions } from 'expo-image-picker';

type VideoUploaderProps = {
  onUploadComplete?: (videoData: { videoId: string; url: string }) => void;
  onUploadError?: (error: Error) => void;
};

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing('videoUploader', {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const uploadedFile = res[0];
        Alert.alert(
          'Upload Complete',
          'Your video has been uploaded successfully.'
        );

        if (onUploadComplete) {
          onUploadComplete({
            videoId: uploadedFile.key,
            url: uploadedFile.ufsUrl,
          });
        }
      }
    },
    onUploadError: (error) => {
      Alert.alert('Upload Error', error.message);
      if (onUploadError) {
        console.log('error', error);
        onUploadError(error);
      }
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleSelectVideo = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload videos',
          [{ text: 'Cancel' }, { text: 'Open Settings', onPress: openSettings }]
        );
        return;
      }

      // Pick a video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos', 'images'] as any as MediaTypeOptions,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('asset', asset);

        // Create File object from URI
        const response = await fetch(asset.uri);
        console.log('got response', response);
        const blob = await response.blob();
        const fileName = asset.uri.split('/').pop() || 'video.mp4';
        const file = new File([blob], fileName, {
          type: asset.mimeType || 'video/mp4',
        });
        console.log('file', file);

        // Upload the file
        await startUpload([file]);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      if (onUploadError) {
        onUploadError(
          error instanceof Error ? error : new Error('Unknown error occurred')
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {isUploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.progressText}>
            {Math.round(uploadProgress * 100)}%
          </Text>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <VideoIcon size={48} color="#777" />
          <Button title="Sélectionner une vidéo" onPress={handleSelectVideo} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  uploadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});
