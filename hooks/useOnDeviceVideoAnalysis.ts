import { useState, useCallback, useEffect } from 'react';
import ExpoModuleTestModule from '@/modules/expo-module-test/src/ExpoModuleTestModule';
import ExpoVideoAnalyzerModule from '@/modules/expo-video-analyzer/src/ExpoVideoAnalyzerModule';

export type AnalysisResult = {
  status: string;
  analysisData?: any;
  errorMessage?: string;
};

export function useOnDeviceVideoAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // useEffect(() => {
  //   const subscription = ExpoVideoAnalyzerModule.addListener('onChange', (event) => {
  //     console.log(event);
  //   });
  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);
  const analyze = useCallback(async (uri: string): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setResult(null);
    // const hello = await ExpoModuleTestModule.hello();
    // console.log(hello);
    try {
      const analysisResult = await ExpoVideoAnalyzerModule.hello();
      console.log(analysisResult);
      // setResult(analysisResult);
      // setAnalyzing(false);
      // return analysisResult;
      return {
        status: 'success',
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
