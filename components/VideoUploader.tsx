import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { openSettings } from 'expo-linking';
import { UploadCloud } from 'lucide-react-native';
import { MediaType } from 'expo-image-picker';
// import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api'; // Commented out as backend API is replaced
import { useAuth } from '@clerk/clerk-expo';
import { SupportService } from '@/lib/services/support/supportService';
import { useRevenueCat } from '@/providers/RevenueCat';

// Import our new native module
import ExpoVideoAnalyzer from '@/modules/expo-video-analyzer';
import { VideoAnalysisResult } from '@/modules/expo-video-analyzer/src/ExpoVideoAnalyzer.types';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';

type VideoUploaderProps = {
  onUploadComplete?: (videoData: {
    videoStoragePath: string;
    url: string;
    videoDuration: number;
  }) => Promise<string>;
  onUploadError?: (error: Error) => void;
  onUploadStart?: () => void;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (
    analysisData: any,
    videoId: string,
    manualEditRequired: boolean
  ) => void;
  onAnalysisError?: (error: string) => void;
  onAnalysisSkip?: () => void;
  onManualEdit?: () => void;
};

type UploadState = 'idle' | 'selecting' | 'uploading' | 'analyzing' | 'error';

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  onAnalysisSkip,
  onManualEdit,
}: VideoUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const { getToken, isSignedIn } = useAuth();
  const { userUsage, isPro, isReady } = useRevenueCat();

  const sourceVideosUsed = userUsage?.source_videos_used || 0;
  const sourceVideosLimit = userUsage?.source_videos_limit || 10;
  const limitReached = !isPro && sourceVideosUsed >= sourceVideosLimit;

  const getStatusMessage = (state: UploadState) => {
    switch (state) {
      case 'selecting':
        return 'Sélection de la vidéo...';
      case 'uploading':
        return `Upload en cours (${uploadProgress}%)...`;
      case 'analyzing':
        return 'Notre IA examine votre vidéo';
      case 'error':
        return statusMessage;
      default:
        return '';
    }
  };

  const handleError = async (error: Error | string) => {
    console.error('Error in video upload/analysis:', error);

    const errorMessage = error instanceof Error ? error.message : error;

    // Ne pas traiter comme une erreur si c'est juste un problème d'analyse
    if (
      errorMessage.includes('Cannot access or analyze video content') ||
      errorMessage.includes('Analyse échouée') ||
      errorMessage.includes('Analysis failed')
    ) {
      console.log(
        '📹 Analyse non disponible, redirection directe vers édition manuelle'
      );

      // Redirection directe vers l'édition manuelle sans affichage d'erreur
      if (onManualEdit) {
        onManualEdit();
      }
      setUploadState('idle');
      setStatusMessage('');
      return;
    }

    // Afficher l'erreur seulement pour les vraies erreurs (upload, réseau, etc.)
    setUploadState('error');

    let userMessage = 'Une erreur est survenue';
    let shouldNotifySupport = true;

    if (errorMessage.includes('quota')) {
      userMessage = "Limite d'analyse quotidienne atteinte";
      shouldNotifySupport = false;
    } else if (errorMessage.includes('trop volumineuse')) {
      userMessage = 'La vidéo est trop volumineuse (max 100MB)';
      shouldNotifySupport = false;
    } else if (errorMessage.includes('réseau')) {
      userMessage = 'Erreur de connexion';
    }

    setStatusMessage(userMessage);
    if (onUploadError)
      onUploadError(error instanceof Error ? error : new Error(userMessage));

    // Notification du support seulement en mode production et pour les vraies erreurs
    const isDev = __DEV__ || process.env.NODE_ENV === 'development';

    if (shouldNotifySupport && !isDev) {
      try {
        const clerkToken = await getToken();
        if (clerkToken) {
          await SupportService.reportIssue({
            jobId: currentVideoId || 'unknown',
            errorMessage: errorMessage,
            token: clerkToken,
            context: {
              uploadState,
              uploadProgress,
              currentVideoId,
            },
            notifyUser: true,
          });
        }
      } catch (supportError) {
        console.error('Failed to report to support:', supportError);
      }
    }
  };

  const handleSelectVideo = async () => {
    try {
      if (!isSignedIn) {
        console.warn('🔒 Upload tentative sans authentification');
        Alert.alert(
          'Authentification requise',
          'Veuillez vous connecter pour uploader des vidéos'
        );
        return;
      }

      setUploadState('selecting');
      setStatusMessage('');
      if (onUploadStart) onUploadStart();

      console.log('📱 Demande de permission galerie...');
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.warn('❌ Permission galerie refusée:', status);
        setUploadState('idle');
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l&apos;accès à la galerie pour uploader des vidéos',
          [
            { text: 'Annuler' },
            { text: 'Ouvrir les paramètres', onPress: openSettings },
          ]
        );
        return;
      }

      console.log('🎥 Sélection de la vidéo...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'] as any as MediaType,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 300,
        // base64: true, // Not needed for on-device analysis
      });
      console.log('result', result);

      if (result.canceled) {
        console.log('⏹️ Sélection annulée par l&apos;utilisateur');
        setUploadState('idle');
        return;
      }

      if (!result.assets[0]) {
        console.error('❌ Aucun asset retourné par le picker');
        throw new Error('Aucune vidéo sélectionnée');
      }

      const asset = result.assets[0];
      console.log('📊 Métadonnées vidéo:', {
        fileName: asset.fileName,
        type: asset.mimeType,
        size: asset.fileSize,
        duration: asset.duration,
        width: asset.width,
        height: asset.height,
        // base64Present: !!asset.base64,
      });

      // Vérifier la taille du fichier (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (asset.fileSize && asset.fileSize > maxSize) {
        console.warn('❌ Fichier trop volumineux:', {
          size: asset.fileSize,
          maxSize,
          diff: asset.fileSize - maxSize,
        });
        throw new Error('La vidéo est trop volumineuse (max 100MB)');
      }

      // --- Début de la nouvelle logique d'analyse on-device ---
      setUploadState('analyzing');
      setStatusMessage('Analyse en cours...');
      if (onAnalysisStart) onAnalysisStart();

      let videoId: string | undefined;
      try {
        // First, upload the video to S3 (still needed for storage)
        // This part remains similar to your original logic, but without the backend analysis call
        setStatusMessage('Préparation de l&apos;upload...');
        const fileName = asset.fileName || 'video.mp4';
        const fileType = asset.mimeType || 'video/mp4';

        const clerkToken = await getToken();
        if (!clerkToken) {
          throw new Error(
            'Impossible d&apos;obtenir le token d&apos;authentification'
          );
        }

        // Get presigned URL
        const presignedResponse = await fetch(API_ENDPOINTS.S3_UPLOAD(), {
          method: 'POST',
          headers: API_HEADERS.CLERK_AUTH(clerkToken),
          body: JSON.stringify({
            fileName,
            fileType,
            fileSize: asset.fileSize,
          }),
        });

        if (!presignedResponse.ok) {
          const errorText = await presignedResponse.text();
          throw new Error(
            `Échec de la préparation du téléchargement: ${errorText}`
          );
        }

        const {
          data: { presignedUrl, publicUrl, fileName: s3FileName },
        } = await presignedResponse.json();
        setCurrentVideoId(s3FileName);

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', presignedUrl);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
              setStatusMessage(`Upload en cours (${progress}%)...`);
            }
          };
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error('Échec du téléchargement'));
            }
          };
          xhr.onerror = (error) => {
            reject(new Error('Erreur réseau'));
          };
          xhr.send(blob);
        });

        // Get video ID from parent after upload
        if (onUploadComplete) {
          videoId = await onUploadComplete({
            videoStoragePath: s3FileName,
            url: publicUrl,
            videoDuration: Math.floor((asset.duration || 0) / 1000),
          });
        }

        if (!videoId) {
          throw new Error('Failed to get video ID after upload');
        }

        // Now, perform on-device analysis
        setStatusMessage('Analyse on-device en cours...');
        const analysisResult: VideoAnalysisResult =
          await ExpoVideoAnalyzer.analyzeVideo(asset.uri);

        if (analysisResult.status === 'success') {
          if (onAnalysisComplete) {
            // Here, you'll need to parse analysisResult.analysisResult (string) into your desired format
            // For now, we'll just pass it as is, assuming it's a JSON string or similar
            const parsedAnalysisData = analysisResult.analysisResult
              ? JSON.parse(analysisResult.analysisResult)
              : null; // Adjust parsing as needed

            // Determine if manual edit is required based on parsed data or analysisResult.status
            const manualEditRequired =
              !parsedAnalysisData || parsedAnalysisData.requires_manual_edit; // Example condition

            await onAnalysisComplete(
              parsedAnalysisData,
              videoId,
              manualEditRequired
            );
          }
          setUploadState('idle');
          setStatusMessage('');
        } else {
          // Handle analysis error from native module
          throw new Error(
            analysisResult.errorMessage || 'Analyse on-device échouée'
          );
        }
      } catch (error) {
        console.error(
          '❌ Erreur dans le processus d&apos;upload/analyse:',
          error
        );
        handleError(error instanceof Error ? error : new Error(String(error)));
      }
      // --- Fin de la nouvelle logique d'analyse on-device ---
    } catch (error) {
      console.error('❌ Erreur globale dans handleSelectVideo:', error);
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {uploadState !== 'idle' ? (
        <View style={styles.loadingContainer}>
          {uploadState === 'error' ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{statusMessage}</Text>
              <View style={styles.errorActions}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setUploadState('idle');
                    setStatusMessage('');
                    setCurrentVideoId(null);
                  }}
                >
                  <Text style={styles.retryButtonText}>
                    Réessayer l&apos;upload
                  </Text>
                </TouchableOpacity>
                {currentVideoId && (
                  <TouchableOpacity
                    style={[styles.retryButton, styles.editButton]}
                    onPress={() => {
                      if (onManualEdit) {
                        onManualEdit();
                      }
                    }}
                  >
                    <Text style={styles.retryButtonText}>
                      Éditer les informations
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.statusText}>
                {getStatusMessage(uploadState)}
              </Text>
              {uploadState === 'analyzing' && (
                <>
                  <Text style={styles.infoText}>
                    Notre IA analyse chaque segment de votre vidéo pour
                    comprendre sa structure narrative.
                  </Text>
                  <Text style={styles.infoText}>
                    Note: L&apos;analyse peut échouer si la vidéo contient des
                    personnes identifiables, est trop longue ou ne respecte pas
                    les règles de contenu de Gemini.
                  </Text>
                  <Text style={styles.waitText}>
                    Vous pouvez fermer cette page et revenir plus tard.
                    L&apos;analyse continuera en arrière-plan.
                  </Text>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => {
                      if (onAnalysisSkip) onAnalysisSkip();
                      setUploadState('idle');
                      setStatusMessage('');
                    }}
                  >
                    <Text style={styles.skipButtonText}>
                      Ignorer l&apos;analyse et remplir manuellement
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      ) : (
        <View style={styles.idleContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, limitReached && styles.disabledButton]}
            onPress={handleSelectVideo}
            disabled={limitReached}
          >
            <UploadCloud size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Uploader une vidéo</Text>
          </TouchableOpacity>
          {!isPro && (
            <Text style={styles.limitText}>
              {sourceVideosUsed} / {sourceVideosLimit} vidéos utilisées
            </Text>
          )}
          {limitReached && (
            <Text style={styles.limitReachedText}>
              Limite de vidéos sources atteinte. Supprimez une vidéo pour en
              ajouter une nouvelle ou passez Pro.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    minHeight: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
  },
  idleContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  limitText: {
    color: '#888',
    fontSize: 12,
  },
  limitReachedText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  waitText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#333',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
});
