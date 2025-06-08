import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Volume2, VolumeX } from 'lucide-react-native';
import { AnyVideoType, getVideoUrl } from '@/types/video';

type VideoPlayerProps = {
  video: AnyVideoType | null;
  style?: object;
  showControls?: boolean;
  autoPlay?: boolean;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: () => void;
};

export default function VideoPlayer({
  video,
  style,
  showControls = true,
  autoPlay = false,
  onLoadStart,
  onLoad,
  onError,
}: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(true); // Start muted to avoid codec errors
  const videoUrl = video ? getVideoUrl(video) : null;

  const player = useVideoPlayer(
    videoUrl ? { uri: videoUrl } : null,
    (player) => {
      player.muted = isMuted;
    }
  );

  useEffect(() => {
    if (videoUrl) {
      onLoadStart?.();
      player.replaceAsync({ uri: videoUrl });
    }
  }, [videoUrl]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!video || !videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={[styles.container, style]}
        contentFit="contain"
        nativeControls={showControls}
      />

      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        {isMuted ? (
          <VolumeX size={20} color="#fff" />
        ) : (
          <Volume2 size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    position: 'relative',
    width: '100%',
  },
  container: {
    width: '100%',
    height: 240,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
