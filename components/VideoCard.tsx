import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Clock, Tag, Play, Pause, FileVideo } from 'lucide-react-native';
// TEMPORARILY DISABLED FOR ANDROID CRASH FIX
// import { useVideoPlayer, VideoView } from 'expo-video';
import { VideoType } from '@/types/video';

type VideoCardProps = {
  video: VideoType;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  onPress: () => void;
  onPlayToggle: () => void;
  onLoadStart: () => void;
  onLoad: () => void;
  onError: () => void;
};

export default function VideoCard({
  video,
  isPlaying,
  isLoading,
  hasError,
  onPress,
  onPlayToggle,
}: VideoCardProps) {
  // Debug: Log video data to help diagnose the text rendering issue
  React.useEffect(() => {
    if (video?.tags && !Array.isArray(video.tags)) {
      console.warn(
        '🚨 VideoCard: video.tags is not an array:',
        video.tags,
        typeof video.tags
      );
    }
  }, [video]);
  // TEMPORARILY DISABLED FOR ANDROID CRASH FIX
  // const player = useVideoPlayer({ uri: video.upload_url }, (player) => {
  //   player.muted = true;
  //   player.shouldPlay = isPlaying;
  // });

  // useEffect(() => {
  //   if (isPlaying) {
  //     player.play();
  //   } else {
  //     player.pause();
  //   }
  // }, [isPlaying, player]);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'processing':
        return '#f59e0b'; // amber
      case 'pending':
        return '#6b7280'; // gray
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Prêt';
      case 'processing':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Erreur';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.videoPreview}>
        {/* Beautiful video placeholder with better design */}
        <View style={styles.videoFallback}>
          <View style={styles.videoIconContainer}>
            <FileVideo size={32} color="#007AFF" />
          </View>
          <Text style={styles.fallbackTitle}>
            {video.title && typeof video.title === 'string'
              ? video.title
              : 'Vidéo sans titre'}
          </Text>
          <View style={styles.videoBadges}>
            {video.duration_seconds && video.duration_seconds > 0 && (
              <View style={styles.durationChip}>
                <Text style={styles.durationChipText}>
                  {formatDuration(video.duration_seconds)}
                </Text>
              </View>
            )}
            {video.processing_status ? (
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(video.processing_status) },
                ]}
              >
                <Text style={styles.statusChipText}>
                  {getStatusText(video.processing_status)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ORIGINAL VIDEO RENDERING CODE - TEMPORARILY DISABLED
        {hasError ? (
          <View style={styles.videoFallback}>
            <FileVideo size={32} color="#007AFF" />
          </View>
        ) : (
          <VideoView
            player={player}
            style={styles.videoThumbnail}
            nativeControls={false}
            contentFit="cover"
            onFirstFrameRender={onLoad}
          />
        )}
        */}

        {isLoading && (
          <View style={styles.videoLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        {!hasError && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
          >
            {isPlaying ? (
              <Pause size={16} color="#fff" />
            ) : (
              <Play size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title && typeof video.title === 'string'
            ? video.title
            : 'Vidéo sans titre'}
        </Text>

        {video.description && video.description.trim() ? (
          <Text style={styles.videoDescription} numberOfLines={2}>
            {video.description}
          </Text>
        ) : null}

        <View style={styles.videoMeta}>
          <View style={styles.dateContainer}>
            <Clock size={12} color="#888" />
            <Text style={styles.dateText}>
              {video.created_at
                ? new Date(video.created_at).toLocaleDateString()
                : 'Date inconnue'}
            </Text>
          </View>

          {video.tags && Array.isArray(video.tags) && video.tags.length > 0 ? (
            <View style={styles.tagContainer}>
              <Tag size={12} color="#888" />
              <Text style={styles.tagText} numberOfLines={1}>
                {video.tags
                  .slice(0, 2)
                  .filter((tag) => tag && typeof tag === 'string')
                  .join(', ')}
                {video.tags.length > 2 ? ` +${video.tags.length - 2}` : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: 180,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  fallbackTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 4,
  },
  durationChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  statusChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 4,
  },
  statusChipText: {
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
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  videoDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 18,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: 12,
  },
  tagText: {
    color: '#888',
    fontSize: 12,
    flex: 1,
  },
});
