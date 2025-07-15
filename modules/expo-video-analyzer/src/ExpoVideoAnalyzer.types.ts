export type VideoAnalysisResult = {
  status: 'success' | 'error' | 'not_implemented';
  analysisResult?: string; // The raw output from VLMEvaluator
  errorMessage?: string; // If status is 'error'
};

export type ExpoVideoAnalyzerModuleEvents = {
  onChange: (params: VideoAnalysisResult) => void;
};