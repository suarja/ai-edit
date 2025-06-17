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
import { MediaType } from 'expo-image-picker';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';

type VideoUploaderProps = {
  onUploadComplete?: (videoData: { videoId: string; url: string }) => void;
  onUploadError?: (error: Error) => void;
  onUploadStart?: () => void;
};

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
  onUploadStart,
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Use Clerk authentication instead of Supabase
  const { getToken, isSignedIn } = useAuth();

  const handleSelectVideo = async () => {
    try {
      // Check if user is signed in
      if (!isSignedIn) {
        Alert.alert(
          'Authentification requise',
          'Veuillez vous connecter pour uploader des vidéos'
        );
        return;
      }

      // Show immediate feedback when user clicks
      setIsUploading(true);
      setUploadStatus('Ouverture de la galerie...');
      
      // Notify parent that upload started (to clear any errors)
      if (onUploadStart) {
        onUploadStart();
      }

      console.log('Starting video selection...');

      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setIsUploading(false);
        setUploadStatus('');
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à la galerie pour uploader des vidéos',
          [{ text: 'Annuler' }, { text: 'Ouvrir les paramètres', onPress: openSettings }]
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
            : 'Inconnue';
          setUploadStatus(`Fichier sélectionné: ${fileSizeMB}MB`);

          console.log('Getting presigned URL from backend...');
          setUploadStatus('Préparation du téléchargement...');

          // Get Clerk JWT token
          const clerkToken = await getToken();
          if (!clerkToken) {
            throw new Error('Impossible d\'obtenir le token d\'authentification');
          }

          console.log('🔑 Got Clerk token, making request to backend...');

          // Get presigned URL from backend using Clerk authentication
          const presignedResponse = await fetch(API_ENDPOINTS.S3_UPLOAD(), {
            method: 'POST',
            headers: API_HEADERS.CLERK_AUTH(clerkToken),
            body: JSON.stringify({
              fileName,
              fileType,
            }),
          });

          console.log('Presigned response:', presignedResponse);

          if (!presignedResponse.ok) {
            const errorText = await presignedResponse.text();
            console.error('Backend error response:', errorText);
            throw new Error(
              `Échec de la préparation du téléchargement: ${presignedResponse.status}`
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

          // Upload to cloud storage
          console.log('Uploading to cloud storage...');
          setUploadStatus('Téléchargement en cours...');
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            // No custom headers needed - let browser set correct Content-Type
            // Presigned URLs handle authentication automatically
          });

          if (!uploadResponse.ok) {
            throw new Error(`Échec du téléchargement: ${uploadResponse.status}`);
          }

          console.log('Upload successful! Public URL:', publicUrl);
          setUploadStatus('Téléchargement terminé!');

          // No more success alert - just notify parent component
          if (onUploadComplete) {
            onUploadComplete({
              videoId: s3FileName,
              url: publicUrl,
            });
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setUploadStatus('Erreur de téléchargement');
          
          // Only show alert for critical errors
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Téléchargement échoué';
          if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
            Alert.alert(
              'Erreur d\'authentification',
              'Veuillez vous reconnecter et réessayer'
            );
          }
          
          if (onUploadError) {
            onUploadError(
              uploadError instanceof Error
                ? uploadError
                : new Error('Téléchargement échoué')
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
          error instanceof Error ? error : new Error('Une erreur inconnue s\'est produite')
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
