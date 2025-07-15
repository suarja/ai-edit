import { useState, useCallback } from 'react';
import ExpoVideoAnalyzer from '@/modules/expo-video-analyzer';

export type AnalysisResult = {
  status: string;
  analysisData?: any;
  errorMessage?: string;
};

export function useOnDeviceVideoAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (uri: string): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setResult(null);
    try {
      const analysisResult = await ExpoVideoAnalyzer.analyzeVideo(uri);
      setResult(analysisResult);
      setAnalyzing(false);
      return analysisResult;
    } catch (error) {
      setResult({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      setAnalyzing(false);
      throw error;
    }
  }, []);

  const reset = () => {
    setAnalyzing(false);
    setResult(null);
  };

  return { analyze, analyzing, result, reset };
}
