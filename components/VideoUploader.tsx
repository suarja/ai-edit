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

      setUploadStatus('Sélectionnez votre vidéo...');

      // Pick a video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'] as any as MediaType,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 300,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

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

          setUploadStatus('Préparation du téléchargement...');

          // Get Clerk JWT token
          const clerkToken = await getToken();
          if (!clerkToken) {
            throw new Error('Impossible d\'obtenir le token d\'authentification');
          }


          // Get presigned URL from backend using Clerk authentication
          const presignedResponse = await fetch(API_ENDPOINTS.S3_UPLOAD(), {
            method: 'POST',
            headers: API_HEADERS.CLERK_AUTH(clerkToken),
            body: JSON.stringify({
              fileName,
              fileType,
            }),
          });


          if (!presignedResponse.ok) {
            const errorText = await presignedResponse.text();
            throw new Error(
              `Échec de la préparation du téléchargement: ${presignedResponse.status}`
            );
          }

          const {
            data: { presignedUrl, publicUrl, fileName: s3FileName },
          } = await presignedResponse.json();

          // Convert asset to blob for upload
          setUploadStatus('Conversion du fichier...');
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          // Upload to cloud storage
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

          setUploadStatus('Téléchargement terminé!');

          // No more success alert - just notify parent component
          if (onUploadComplete) {
            onUploadComplete({
              videoId: s3FileName,
              url: publicUrl,
            });
          }
        } catch (uploadError) { 
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
