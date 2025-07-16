import { NativeModule, requireNativeModule } from 'expo';
import {
  VideoAnalysisResult,
  ExpoVideoAnalyzerModuleEvents,
} from './ExpoVideoAnalyzer.types';
declare class ExpoVideoAnalyzerModule extends NativeModule<ExpoVideoAnalyzerModuleEvents> {
  analyzeVideo(videoUri: string): Promise<VideoAnalysisResult>;
}

export default requireNativeModule<ExpoVideoAnalyzerModule>(
  'ExpoVideoAnalyzer'
);
