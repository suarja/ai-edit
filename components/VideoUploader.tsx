import React, { useState } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { openSettings } from 'expo-linking';
import { Video as VideoIcon } from 'lucide-react-native';
import { MediaType } from 'expo-image-picker';
import { env } from '@/lib/config/env';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';
import { supabase } from '@/lib/supabase';

type VideoUploaderProps = {
  onUploadComplete?: (videoData: { videoId: string; url: string }) => void;
  onUploadError?: (error: Error) => void;
};

const isWeb = Platform.OS === 'web';

// Helper to get the correct Supabase Functions URL
const getSupabaseFunctionUrl = (url: string) => {
  // Convert the base Supabase URL to the Functions URL format
  return url
    .replace('https://', 'https://')
    .replace('.supabase.co', '.functions.supabase.co');
};

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSelectVideo = async () => {
    try {
      // Show immediate feedback when user clicks
      setIsUploading(true);
      setUploadStatus('Ouverture de la galerie...');

      console.log('Starting video selection...');

      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setIsUploading(false);
        setUploadStatus('');
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload videos',
          [{ text: 'Cancel' }, { text: 'Open Settings', onPress: openSettings }]
        );
        return;
      }

      console.log('Permissions granted, launching image picker...');
      setUploadStatus('Sélectionnez votre vidéo...');

      // Pick a video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'] as any as MediaType,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 300,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Selected asset:', asset);

        // Show file selection confirmation
        setUploadStatus('Préparation du fichier...');
        setUploadProgress(0);

        try {
          const fileName = asset.fileName || 'video.mp4';
          const fileType = asset.mimeType || 'video/mp4';

          // Show file size info
          const fileSizeMB = asset.fileSize
            ? (asset.fileSize / (1024 * 1024)).toFixed(1)
            : 'Unknown';
          setUploadStatus(`Fichier sélectionné: ${fileSizeMB}MB`);

          console.log('Getting presigned URL from S3...');
          setUploadStatus("Génération de l'URL de téléchargement...");

          const session = await supabase.auth.getSession();
          // Get presigned URL from Supabase function using the correct URL format
          const presignedResponse = await fetch(API_ENDPOINTS.S3_UPLOAD(), {
            method: 'POST',
            headers: API_HEADERS.USER_AUTH(
              session.data.session?.access_token ?? ''
            ),
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
            data: { presignedUrl, publicUrl, fileName: s3FileName },
          } = await presignedResponse.json();
          console.log('Got presigned URL:', {
            presignedUrl,
            publicUrl,
            s3FileName,
          });

          console.log(presignedUrl);
          // Convert asset to blob for upload
          console.log('Converting asset to blob...');
          setUploadStatus('Conversion du fichier...');
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          console.log('Blob created:', { size: blob.size, type: blob.type });

          // Upload directly to S3 using presigned URL
          console.log('Uploading to S3...');
          setUploadStatus('Téléchargement vers S3...');
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': fileType,
              ...(isWeb && {
                Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
                'x-client-platform': 'web',
              }),
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed: ${uploadResponse.status}`);
          }

          console.log('Upload successful! Public URL:', publicUrl);
          setUploadStatus('Téléchargement terminé!');

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
          setUploadStatus('Erreur de téléchargement');
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
          setUploadStatus('');
          setUploadProgress(0);
        }
      } else {
        // User cancelled selection
        setIsUploading(false);
        setUploadStatus('');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      setIsUploading(false);
      setUploadStatus('');
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
          <Text style={styles.progressText}>{uploadStatus}</Text>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <VideoIcon size={32} color="#777" />
          <Button title="Sélectionner une vidéo" onPress={handleSelectVideo} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 120, // Reduced from 200px to 120px
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
    gap: 12, // Reduced gap
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressText: {
    color: '#fff',
    fontSize: 14, // Slightly smaller text
    marginTop: 8,
    textAlign: 'center',
  },
});
