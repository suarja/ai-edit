import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Volume2, VolumeX, FileVideo } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AnyVideoType, getVideoUrl } from '@/lib/types/video';

interface VideoPlayerProps {
  video: AnyVideoType | null;
  style?: any;
  showControls?: boolean;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export default function VideoPlayer({
  video,
  style,
  showControls = true,
  onLoadStart,
  onLoad,
  onError,
}: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(true); // Start muted to avoid codec errors
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const videoUrl = video ? getVideoUrl(video) : null;

  const player = useVideoPlayer(
    videoUrl ? { uri: videoUrl } : null,
    (player) => {
      player.muted = isMuted;
    }
  );

  useEffect(() => {
    if (videoUrl) {
      setHasError(false);
      setIsLoading(true);
      onLoadStart?.();

      player
        .replaceAsync({ uri: videoUrl })
        .then(() => {
          setIsLoading(false);
          onLoad?.();
        })
        .catch((error) => {
          console.error('Video load error:', error);
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
        });
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
        <View style={styles.videoContainer}>
          <View style={styles.videoFallback}>
            <FileVideo size={48} color="#007AFF" />
            <Text style={styles.fallbackTitle}>Aucune vidéo disponible</Text>
          </View>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.videoContainer}>
          <View style={styles.videoFallback}>
            <FileVideo size={48} color="#ef4444" />
            <Text style={styles.fallbackTitle}>Erreur de chargement vidéo</Text>
            <Text style={styles.fallbackSubtitle}>
              Impossible de lire cette vidéo
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                if (videoUrl) {
                  player.replaceAsync({ uri: videoUrl });
                }
              }}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Chargement de la vidéo...</Text>
          </View>
        )}

        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={showControls}
        />

        {!showControls && (
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            {isMuted ? (
              <VolumeX size={20} color="#fff" />
            ) : (
              <Volume2 size={20} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
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
