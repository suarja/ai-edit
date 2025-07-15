import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useVideoSelector, VideoAsset } from '@/hooks/useVideoSelector';

interface VideoSelectorProps {
  onSelect: (asset: VideoAsset) => void;
  onError: (error: Error) => void;
  label?: string;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  onSelect,
  onError,
  label,
}) => {
  const { selectVideo } = useVideoSelector();
  const [loading, setLoading] = React.useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const asset = await selectVideo();
      onSelect(asset);
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: loading ? 0.6 : 1,
      }}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
          {label || 'Sélectionner une vidéo'}
        </Text>
      )}
    </TouchableOpacity>
  );
};
