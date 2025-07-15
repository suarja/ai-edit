import { NativeModule, requireNativeModule } from 'expo';
import { VideoAnalysisResult } from './ExpoVideoAnalyzer.types';

declare class ExpoVideoAnalyzerModule extends NativeModule<{
  analyzeVideo(videoUri: string): Promise<VideoAnalysisResult>;
}> {
  analyzeVideo(videoUri: string): Promise<VideoAnalysisResult>;
}

export default requireNativeModule<ExpoVideoAnalyzerModule>(
  'ExpoVideoAnalyzer'
);
