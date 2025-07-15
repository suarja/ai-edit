import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import {
  useOnDeviceVideoAnalysis,
  AnalysisResult,
} from '@/hooks/useOnDeviceVideoAnalysis';

interface VideoAnalyzerProps {
  uri?: string;
  onAnalysis: (result: AnalysisResult) => void;
  onError: (error: Error) => void;
  label?: string;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  uri,
  onAnalysis,
  onError,
  label,
}) => {
  const { analyze, analyzing } = useOnDeviceVideoAnalysis();
  const [localUri, setLocalUri] = React.useState<string | undefined>(uri);

  React.useEffect(() => {
    if (uri) {
      setLocalUri(uri);
      handleAnalyze(uri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const handleAnalyze = async (targetUri?: string) => {
    if (!targetUri) return;
    try {
      const result = await analyze(targetUri);
      onAnalysis(result);
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
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
        opacity: analyzing ? 0.6 : 1,
      }}
      onPress={() => handleAnalyze(localUri)}
      disabled={analyzing || !localUri}
    >
      {analyzing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
          {label || 'Analyser la vidéo'}
        </Text>
      )}
    </TouchableOpacity>
  );
};
