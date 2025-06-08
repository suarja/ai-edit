import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Tag, AlertCircle } from 'lucide-react-native';
import { AnyVideoType } from '@/types/video';

interface VideoDetailsProps {
  video: AnyVideoType | null;
  error: string | null;
}

export default function VideoDetails({ video, error }: VideoDetailsProps) {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#4ADE80';
      case 'rendering':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#888';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#0A2F1E';
      case 'rendering':
        return '#2E1F05';
      case 'error':
        return '#2D1116';
      default:
        return '#1a1a1a';
    }
  };

  // Error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={20} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aucune vidéo trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video title */}
      <Text style={styles.title}>{video.title || 'Untitled video'}</Text>

      {/* Status indicator for generated videos */}
      {'render_status' in video && video.render_status && (
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.status,
              {
                color: getStatusColor(video.render_status),
                backgroundColor: getStatusBgColor(video.render_status),
              },
            ]}
          >
            {video.render_status.toUpperCase()}
          </Text>
          <Text style={styles.dateText}>
            {new Date(video.created_at).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Description for uploaded videos */}
      {video.description && (
        <Text style={styles.description}>{video.description}</Text>
      )}

      {/* Meta information - show different data based on video type */}
      <View style={styles.metaInfo}>
        {/* Duration */}
        <View style={styles.metaItem}>
          <Clock size={16} color="#888" />
          <Text style={styles.metaText}>
            {formatDuration(
              video.duration_seconds ||
                ('duration' in video ? video.duration : undefined)
            )}
          </Text>
        </View>

        {/* Created date */}
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Created:</Text>
          <Text style={styles.metaText}>
            {new Date(video.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Tags for uploaded videos */}
      {'tags' in video && video.tags && video.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <View style={styles.tagHeader}>
            <Tag size={16} color="#888" />
            <Text style={styles.sectionTitle}>Tags</Text>
          </View>
          <View style={styles.tagsContainer}>
            {video.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Error message for generated videos with errors */}
      {'render_status' in video &&
        video.render_status === 'error' &&
        'render_error' in video &&
        video.render_error && (
          <View style={styles.errorBox}>
            <AlertCircle size={24} color="#EF4444" />
            <Text style={styles.errorMessageText}>
              {video.render_error ||
                'An error occurred during video processing'}
            </Text>
          </View>
        )}

      {/* Script for generated videos */}
      {'script' in video &&
        video.script &&
        typeof video.script === 'object' &&
        video.script.generated_script && (
          <View style={styles.scriptSection}>
            <Text style={styles.sectionTitle}>Generated Script</Text>
            <View style={styles.scriptContainer}>
              <Text style={styles.scriptText}>
                {video.script.generated_script}
              </Text>
            </View>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
  },
  metaInfo: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    color: '#888',
    fontSize: 14,
  },
  metaText: {
    color: '#ccc',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    color: '#888',
    fontSize: 14,
  },
  tagsSection: {
    gap: 12,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  errorMessageText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  scriptSection: {
    gap: 12,
  },
  scriptContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  scriptText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});
