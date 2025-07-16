import { useState, useCallback,  } from 'react';
import ExpoVideoAnalyzerModule from '@/docs/video-module/expo-video-analyzer/src/ExpoVideoAnalyzerModule';

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
 ;
    try {
     
      return {
        status: 'error',
        analysisData: {
          duration: 100,
          size: 1000000,
          fps: 30,
        },
      };
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
