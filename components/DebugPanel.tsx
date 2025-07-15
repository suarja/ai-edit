import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoSelector } from './VideoSelector';
import { VideoAnalyzer } from './VideoAnalyzer';
import { VideoAsset } from '@/hooks/useVideoSelector';
import { AnalysisResult } from '@/hooks/useOnDeviceVideoAnalysis';

export const DebugPanel: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = React.useState<VideoAsset | null>(
    null
  );
  const [analysisResult, setAnalysisResult] =
    React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSelect = (asset: VideoAsset) => {
    setSelectedAsset(asset);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalysis = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (err: Error) => {
    setError(err.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Panel - Analyse Vidéo Locale</Text>
      <VideoSelector
        onSelect={handleSelect}
        onError={handleError}
        label="Choisir une vidéo locale"
      />
      {selectedAsset && (
        <View style={styles.section}>
          <Text style={styles.label}>Vidéo sélectionnée :</Text>
          <Text style={styles.value}>
            {selectedAsset.fileName || selectedAsset.uri}
          </Text>
          <VideoAnalyzer
            uri={selectedAsset.uri}
            onAnalysis={handleAnalysis}
            onError={handleError}
            label="Analyser cette vidéo"
          />
        </View>
      )}
      {analysisResult && (
        <View style={styles.section}>
          <Text style={styles.label}>Résultat d&apos;analyse :</Text>
          <Text style={styles.value}>
            {JSON.stringify(analysisResult, null, 2)}
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.section}>
          <Text style={styles.error}>Erreur : {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#111',
    borderRadius: 12,
    margin: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
  },
  error: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
});
