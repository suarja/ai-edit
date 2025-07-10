import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

interface VideoThumbnailProps {
  url: string;
  shouldLoad?: boolean;
}

export function VideoThumbnail({
  url,
  shouldLoad = false,
}: VideoThumbnailProps) {
  const [image, setImage] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (shouldLoad && !hasAttemptedLoad) {
      generateThumbnail();
      setHasAttemptedLoad(true);
    }
  }, [shouldLoad, hasAttemptedLoad, url]);

  const generateThumbnail = async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(false);
      const { uri } = await VideoThumbnails.getThumbnailAsync(url, {
        time: 0,
        quality: 0.5, // Lower quality for better performance
      });
      setImage(uri);
    } catch (e) {
      console.warn('Error generating thumbnail:', e);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : error ? (
            <Text style={styles.errorText}>
              Impossible de charger l&apos;aperçu
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 1,
    margin: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  errorText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});
