import React, { useState, useRef, useEffect } from 'react';
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
  onLoadStart,
  onLoad,
  onError,
}: VideoCardProps) {
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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.videoPreview}>
        {/* TEMPORARILY DISABLED FOR ANDROID CRASH FIX - Show fallback instead */}
        <View style={styles.videoFallback}>
          <FileVideo size={32} color="#007AFF" />
          <Text style={styles.fallbackText}>Video Preview</Text>
          <Text style={styles.crashFixText}>
            🚧 Video rendering temporarily disabled for Android crash fix
          </Text>
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

        {video.duration_seconds > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration_seconds)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || 'Vidéo sans titre'}
        </Text>

        {video.description && (
          <Text style={styles.videoDescription} numberOfLines={2}>
            {video.description}
          </Text>
        )}

        <View style={styles.videoMeta}>
          <View style={styles.dateContainer}>
            <Clock size={12} color="#888" />
            <Text style={styles.dateText}>
              {new Date(video.created_at).toLocaleDateString()}
            </Text>
          </View>

          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagContainer}>
              <Tag size={12} color="#888" />
              <Text style={styles.tagText} numberOfLines={1}>
                {video.tags.slice(0, 2).join(', ')}
                {video.tags.length > 2 && ` +${video.tags.length - 2}`}
              </Text>
            </View>
          )}
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
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 4,
  },
  durationText: {
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
  fallbackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  crashFixText: {
    color: '#888',
    fontSize: 12,
  },
});
