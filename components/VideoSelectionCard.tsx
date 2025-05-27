import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, FileVideo } from 'lucide-react-native';
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
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
    >
      <View style={styles.videoPreview}>
        <FileVideo size={32} color={isSelected ? '#10b981' : '#666'} />
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || 'Vidéo sans titre'}
        </Text>

        <View style={styles.videoMeta}>
          <View style={styles.durationContainer}>
            <Clock size={12} color="#888" />
            <Text style={styles.durationText}>
              {formatDuration(video.duration_seconds)}
            </Text>
          </View>

          <Text style={styles.dateText}>
            {new Date(video.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  containerSelected: {
    backgroundColor: '#0A2F1E',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  videoPreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 12,
    gap: 8,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: '#888',
    fontSize: 12,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
});
