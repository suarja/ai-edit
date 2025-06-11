import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Play, Pause, Volume2, VolumeX, FileVideo } from 'lucide-react-native';
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
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoUrl = video ? getVideoUrl(video) : null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  if (!video || !videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.videoContainer}>
          <View style={styles.videoFallback}>
            <FileVideo size={48} color="#007AFF" />
            <Text style={styles.fallbackTitle}>
              {video ? video.title : 'Video Player'}
            </Text>
            <Text style={styles.crashFixText}>
              🚧 Video rendering temporarily disabled for Android crash fix
            </Text>
            <Text style={styles.uriText} numberOfLines={1}>
              URI: {videoUrl}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <View style={styles.videoFallback}>
          <FileVideo size={48} color="#007AFF" />
          <Text style={styles.fallbackTitle}>
            {video ? video.title : 'Video Player'}
          </Text>
          <Text style={styles.crashFixText}>
            🚧 Video rendering temporarily disabled for Android crash fix
          </Text>
          <Text style={styles.uriText} numberOfLines={1}>
            URI: {videoUrl}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleMuteToggle}
          >
            {isMuted ? (
              <VolumeX size={20} color="#fff" />
            ) : (
              <Volume2 size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
  },
  videoFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  crashFixText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  uriText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
