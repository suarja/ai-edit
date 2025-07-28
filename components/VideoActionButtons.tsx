import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
  Linking,
} from 'react-native';
import {
  Download,
  Share as ShareIcon,
  ExternalLink,
  Trash,
  Edit3,
  Play,
  MoreHorizontal,
  Loader,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { AnyVideoType, getVideoUrl } from '@/lib/types/video.types';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

interface VideoActionButtonsProps {
  video: AnyVideoType | null;
  layout?: 'row' | 'column';
  showEdit?: boolean;
  showDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onPlay?: () => void;
  showCopyLink?: boolean;
}

export default function VideoActionButtons({
  video,
  layout = 'column',
  onDelete,
  onEdit,
  onShare,
  showEdit = false,
  showDelete = false,
  showCopyLink = false,
}: VideoActionButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  if (!video) return null;

  const videoUrl = getVideoUrl(video);

  const handleDownload = async () => {
    if (!videoUrl) {
      Alert.alert('Erreur', 'URL de la vidéo non disponible');
      return;
    }

    console.log('videoUrl', videoUrl);

    if (isDownloading) {
      return; // Prevent multiple downloads
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Request permissions first (for Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'Impossible de sauvegarder la vidéo sans permission'
          );
          return;
        }
      }

      // Extract filename from URL
      const fileName = videoUrl.split('/').pop() || `video-${Date.now()}.mp4`;
      console.log('fileName', fileName);
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      console.log('FileSystem.documentDirectory', FileSystem.documentDirectory);
      console.log('fileUri', fileUri);

      // Create download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(Math.round(progress * 100));
        }
      );

      const result = await downloadResumable.downloadAsync();
      console.log('result', result);
      if (result && result.uri) {
        if (Platform.OS === 'ios') {
          // On iOS we can use the sharing API to save to camera roll
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(result.uri);
            Alert.alert(
              'Succès',
              'Vidéo téléchargée et prête à être sauvegardée'
            );
          } else {
            Alert.alert(
              'Téléchargement terminé',
              `Vidéo téléchargée avec succès`
            );
          }
        } else if (Platform.OS === 'android') {
          // On Android, save to media library
          const asset = await MediaLibrary.createAssetAsync(result.uri);
          await MediaLibrary.createAlbumAsync('Videos', asset, false);

          Alert.alert(
            'Téléchargement terminé',
            'Vidéo téléchargée et sauvegardée dans votre galerie',
            [
              {
                text: 'Ouvrir',
                onPress: () =>
                  FileSystem.getContentUriAsync(result.uri).then(
                    (contentUri) => {
                      Linking.openURL(contentUri);
                    }
                  ),
              },
              { text: 'OK' },
            ]
          );
        } else {
          // Web or other platforms
          Alert.alert(
            'Téléchargement terminé',
            `Vidéo téléchargée avec succès`
          );
        }
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      Alert.alert('Erreur', 'Échec du téléchargement de la vidéo');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = async () => {
    if (!videoUrl) return;

    if (isSharing) {
      return; // Prevent multiple share dialogs
    }

    try {
      setIsSharing(true);

      // Always handle sharing directly to avoid conflicts
      await Share.share({
        message: `Regardez ma vidéo: ${videoUrl}`,
        url: videoUrl, // iOS only
        title: 'Ma vidéo générée',
      });
    } catch (err) {
      console.error('Error sharing video:', err);
      Alert.alert('Erreur', 'Impossible de partager la vidéo');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!videoUrl) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(videoUrl);
        Alert.alert('Succès', 'URL copiée dans le presse-papiers');
      } else {
        Alert.alert('URL de la vidéo', videoUrl, [
          { text: 'Fermer', style: 'cancel' },
          {
            text: 'Ouvrir',
            onPress: () => Linking.openURL(videoUrl),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible de copier l'URL");
    }
  };

  const renderDownloadButton = () => {
    if (isDownloading) {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.downloadingButton]}
          disabled
        >
          <Loader size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {downloadProgress > 0
              ? `Téléchargement ${downloadProgress}%`
              : 'Téléchargement...'}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.primaryButton} onPress={handleDownload}>
        <Download size={20} color="#fff" />
        <Text style={styles.primaryButtonText}>Télécharger</Text>
      </TouchableOpacity>
    );
  };

  const renderShareButton = () => {
    if (isSharing) {
      return (
        <TouchableOpacity
          style={[styles.secondaryButton, styles.sharingButton]}
          disabled
        >
          <Loader size={20} color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Partage...</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
        <ShareIcon size={20} color={SHARED_STYLE_COLORS.primary} />
        <Text style={styles.secondaryButtonText}>Partager</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={layout === 'column' ? styles.columnContainer : styles.rowContainer}
    >
      {renderDownloadButton()}

      {renderShareButton()}

      {showCopyLink && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCopyLink}
        >
          <ExternalLink size={20} color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Copier le lien</Text>
        </TouchableOpacity>
      )}

      {showEdit && onEdit && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onEdit}>
          <Edit3 size={20} color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Modifier</Text>
        </TouchableOpacity>
      )}

      {showDelete && onDelete && (
        <TouchableOpacity style={styles.dangerButton} onPress={onDelete}>
          <Trash size={20} color="#fff" />
          <Text style={styles.dangerButtonText}>Supprimer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  columnContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  downloadingButton: {
    backgroundColor: SHARED_STYLE_COLORS.secondary,
    opacity: 0.8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sharingButton: {
    borderColor: SHARED_STYLE_COLORS.secondary,
    opacity: 0.8,
  },
  dangerButton: {
    backgroundColor: SHARED_STYLE_COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
