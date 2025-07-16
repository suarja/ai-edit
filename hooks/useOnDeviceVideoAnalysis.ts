import { useState, useCallback } from 'react';

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
    return {
      status: 'error',
      analysisData: {
        duration: 100,
        size: 1000000,
        fps: 30,
      },
    };
  }, []);

  const reset = () => {
    setAnalyzing(false);
    setResult(null);
  };

  return { analyze, analyzing, result, reset };
}
