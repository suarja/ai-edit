import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

export type VideoAsset = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
};

export function useVideoSelector() {
  const selectVideo = useCallback(async (): Promise<VideoAsset> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission galerie refusée');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 300,
    });
    if (result.canceled || !result.assets[0]) {
      throw new Error('Aucune vidéo sélectionnée');
    }
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      duration: asset.duration,
      width: asset.width,
      height: asset.height,
    };
  }, []);

  return { selectVideo };
}
