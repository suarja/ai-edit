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
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { AnyVideoType, getVideoUrl } from '@/types/video';

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
  if (!video) return null;

  const videoUrl = getVideoUrl(video);

  const handleDownload = async () => {
    if (!videoUrl) {
      Alert.alert('Error', 'Video URL is not available');
      return;
    }

    try {
      // Request permissions first (for Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Cannot save video without permission'
          );
          return;
        }
      }

      // Extract filename from URL
      const fileName = videoUrl.split('/').pop() || `video-${Date.now()}.mp4`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Show download progress
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      Alert.alert('Download', 'Video download has started');

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        if (Platform.OS === 'ios') {
          // On iOS we can use the sharing API to save to camera roll
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(result.uri);
          } else {
            Alert.alert(
              'Download Complete',
              `Video downloaded successfully to: ${result.uri}`
            );
          }
        } else if (Platform.OS === 'android') {
          // On Android, save to media library
          const asset = await MediaLibrary.createAssetAsync(result.uri);
          await MediaLibrary.createAlbumAsync('Videos', asset, false);

          Alert.alert(
            'Download Complete',
            'Video downloaded and saved to your gallery',
            [
              {
                text: 'Open',
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
            'Download Complete',
            `Video downloaded successfully to: ${result.uri}`
          );
        }
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      Alert.alert('Error', 'Failed to download video');
    }
  };

  const handleShare = async () => {
    if (!videoUrl) return;

    try {
      if (onShare) {
        onShare();
      } else {
        await Share.share({
          message: `Check out my video: ${videoUrl}`,
          url: videoUrl, // iOS only
        });
      }
    } catch (err) {
      console.error('Error sharing video:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!videoUrl) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(videoUrl);
        Alert.alert('Success', 'URL copied to clipboard');
      } else {
        Alert.alert('Video URL', videoUrl, [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Open',
            onPress: () => Linking.openURL(videoUrl),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to copy URL');
    }
  };

  return (
    <View
      style={layout === 'column' ? styles.columnContainer : styles.rowContainer}
    >
      <TouchableOpacity style={styles.primaryButton} onPress={handleDownload}>
        <Download size={20} color="#fff" />
        <Text style={styles.primaryButtonText}>Download</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
        <ShareIcon size={20} color="#007AFF" />
        <Text style={styles.secondaryButtonText}>Share</Text>
      </TouchableOpacity>

      {showCopyLink && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCopyLink}
        >
          <ExternalLink size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Copy Link</Text>
        </TouchableOpacity>
      )}

      {showEdit && onEdit && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onEdit}>
          <Edit3 size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </TouchableOpacity>
      )}

      {showDelete && onDelete && (
        <TouchableOpacity style={styles.dangerButton} onPress={onDelete}>
          <Trash size={20} color="#fff" />
          <Text style={styles.dangerButtonText}>Delete</Text>
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
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
