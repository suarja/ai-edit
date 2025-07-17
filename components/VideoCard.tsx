import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Clock, Tag, Play } from 'lucide-react-native';
import { VideoType } from '@/lib/types/video';
import { VideoThumbnail } from './VideoThumbnail';

type VideoCardProps = {
  video: VideoType;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  isVisible?: boolean;
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
  isVisible = false,
  onPress,
  onPlayToggle,
  onLoadStart,
  onLoad,
  onError,
}: VideoCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <VideoThumbnail url={video.upload_url} shouldLoad={isVisible} />

        <View style={styles.duration}>
          <Clock size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.durationText}>
            {formatDuration(video.duration_seconds)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {video.title || 'Sans titre'}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {video.description || 'Aucune description'}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.date}>
            {formatDate(video.created_at || new Date().toISOString())}
          </Text>
          <View style={styles.tags}>
            {video.tags?.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Tag size={12} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#2a2a2a',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIcon: {
    opacity: 0.5,
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: '#888',
    fontSize: 12,
  },
});
