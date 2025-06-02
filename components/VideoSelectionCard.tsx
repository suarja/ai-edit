import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Clock, FileVideo, Play } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { VideoType } from '@/types/video';

type VideoSelectionCardProps = {
  video: VideoType;
  isSelected: boolean;
  onPress: () => void;
};

export default function VideoSelectionCard({
  video,
  isSelected,
  onPress,
}: VideoSelectionCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const player = useVideoPlayer({ uri: video.upload_url }, (player) => {
    player.muted = true;
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.videoPreview}>
        {hasError ? (
          <View style={styles.fallbackContainer}>
            <FileVideo size={32} color={isSelected ? '#10b981' : '#666'} />
            <Text style={styles.fallbackText}>Aperçu indisponible</Text>
          </View>
        ) : (
          <>
            <VideoView
              player={player}
              style={styles.videoThumbnail}
              nativeControls={false}
              contentFit="cover"
              onFirstFrameRender={handleVideoLoad}
            />

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#007AFF" />
              </View>
            )}

            <View style={styles.playOverlay}>
              <Play size={16} color="#fff" fill="#fff" />
            </View>
          </>
        )}

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}

        {video.duration_seconds > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationBadgeText}>
              {formatDuration(video.duration_seconds)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || 'Vidéo sans titre'}
        </Text>

        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color="#888" />
            <Text style={styles.metaText}>
              {formatDuration(video.duration_seconds)}
            </Text>
          </View>

          <Text style={styles.dateText}>
            {new Date(video.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>

        {video.tags && video.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsText} numberOfLines={1}>
              {video.tags.slice(0, 2).join(', ')}
              {video.tags.length > 2 && ` +${video.tags.length - 2}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  containerSelected: {
    backgroundColor: '#0A2F1E',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.4,
  },
  videoPreview: {
    width: '100%',
    height: 140,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fallbackText: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
    gap: 8,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
  tagsContainer: {
    marginTop: 4,
  },
  tagsText: {
    color: '#007AFF',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
