import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VideoType } from '@/types/video';
import VideoSelectionCard from './VideoSelectionCard';

type VideoSelectionCarouselProps = {
  videos: VideoType[];
  selectedVideoIds: string[];
  onVideoToggle: (videoId: string) => void;
};

export default function VideoSelectionCarousel({
  videos,
  selectedVideoIds,
  onVideoToggle,
}: VideoSelectionCarouselProps) {
  if (videos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
        <Text style={styles.emptySubtext}>
          Uploadez d'abord des vidéos dans l'onglet "Vidéos Sources"
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Vidéos Sources</Text>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez les clips à utiliser
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
      >
        {videos.map((video) => (
          <VideoSelectionCard
            key={video.id}
            video={video}
            isSelected={selectedVideoIds.includes(video.id)}
            onPress={() => onVideoToggle(video.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  videoList: {
    paddingRight: 20,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});
