import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Video as VideoIcon } from 'lucide-react-native';
import VideoCard from './VideoCard';
import { VideoTypeWithAnalysis } from '@/lib/types/videoAnalysis';

interface VideoListProps {
  videos: VideoTypeWithAnalysis[];
  playingVideoId: string | null;
  loadingVideoIds: Set<string>;
  errorVideoIds: Set<string>;
  visibleVideoIds: Set<string>;
  onVideoPress: (video: VideoTypeWithAnalysis) => void;
  onPlayToggle: (videoId: string) => void;
  onLoadStart: (videoId: string) => void;
  onLoad: (videoId: string) => void;
  onError: (videoId: string) => void;
  viewabilityConfigCallbackPairs?: any;
  refreshing: boolean;
  onRefresh: () => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  playingVideoId,
  loadingVideoIds,
  errorVideoIds,
  visibleVideoIds,
  onVideoPress,
  onPlayToggle,
  onLoadStart,
  onLoad,
  onError,
  viewabilityConfigCallbackPairs,
  refreshing,
  onRefresh,
}) => {
  if (videos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <VideoIcon size={48} color="#555" />
        <Text style={styles.emptyText}>Aucune vidéo uploadée</Text>
        <Text style={styles.emptySubtext}>
          Commencez par uploader votre première vidéo
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={({ item }) => (
        <VideoCard
          key={item.id}
          video={item}
          isPlaying={playingVideoId === item.id}
          isLoading={loadingVideoIds.has(item.id)}
          hasError={errorVideoIds.has(item.id)}
          onPress={() => onVideoPress(item)}
          onPlayToggle={() => onPlayToggle(item.id)}
          onLoadStart={() => onLoadStart(item.id)}
          onLoad={() => onLoad(item.id)}
          onError={() => onError(item.id)}
          isVisible={visibleVideoIds.has(item.id)}
        />
      )}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
  },
});

export default VideoList;
