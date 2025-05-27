import React, { useState } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSelectVideo = async () => {
    try {
      console.log('Starting video selection...');

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

      console.log('Permissions granted, launching image picker...');

      // Pick a video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'] as any as MediaTypeOptions,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 300,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Selected asset:', asset);

        setIsUploading(true);
        setUploadProgress(0);

        try {
          const fileName = asset.fileName || 'video.mp4';
          const fileType = asset.mimeType || 'video/mp4';

          console.log('Getting presigned URL from S3...');

          // Get presigned URL from our API
          const presignedResponse = await fetch('/api/s3-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName,
              fileType,
            }),
          });

          if (!presignedResponse.ok) {
            throw new Error(
              `Failed to get upload URL: ${presignedResponse.status}`
            );
          }

          const {
            presignedUrl,
            publicUrl,
            fileName: s3FileName,
          } = await presignedResponse.json();
          console.log('Got presigned URL:', {
            presignedUrl,
            publicUrl,
            s3FileName,
          });

          // Convert asset to blob for upload
          console.log('Converting asset to blob...');
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          console.log('Blob created:', { size: blob.size, type: blob.type });

          // Upload directly to S3 using presigned URL
          console.log('Uploading to S3...');
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': fileType,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed: ${uploadResponse.status}`);
          }

          console.log('Upload successful! Public URL:', publicUrl);

          Alert.alert(
            'Upload Complete',
            'Your video has been uploaded successfully to S3.'
          );

          if (onUploadComplete) {
            onUploadComplete({
              videoId: s3FileName,
              url: publicUrl,
            });
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert(
            'Upload Error',
            uploadError instanceof Error ? uploadError.message : 'Upload failed'
          );
          if (onUploadError) {
            onUploadError(
              uploadError instanceof Error
                ? uploadError
                : new Error('Upload failed')
            );
          }
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
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
          <Text style={styles.progressText}>Uploading to S3...</Text>
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
