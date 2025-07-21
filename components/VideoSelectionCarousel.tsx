import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { VideoType } from '@/lib/types/video.types';
import { Upload, Video as VideoIcon } from 'lucide-react-native';
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Vidéos Sources</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez les clips à utiliser
          </Text>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <VideoIcon size={48} color="#666" />
          </View>
          <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
          <Text style={styles.emptySubtext}>
            Uploadez d'abord des vidéos pour pouvoir les utiliser dans vos
            créations
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push('/source-videos')}
          >
            <Upload size={16} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Uploader des vidéos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Vidéos Sources</Text>
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionBadgeText}>
              {selectedVideoIds.length} sélectionnée
              {selectedVideoIds.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez les clips à utiliser pour votre création
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
        decelerationRate="fast"
        snapToInterval={236} // 220 + 16 margin
        snapToAlignment="start"
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

      {selectedVideoIds.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionSummaryText}>
            {selectedVideoIds.length} vidéo
            {selectedVideoIds.length > 1 ? 's' : ''} sélectionnée
            {selectedVideoIds.length > 1 ? 's' : ''} pour la génération
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  selectionBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#888',
    lineHeight: 20,
  },
  videoList: {
    paddingLeft: 4,
    paddingRight: 20,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    backgroundColor: '#333',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  selectionSummary: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  selectionSummaryText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
