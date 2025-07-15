import { NativeModule, requireNativeModule } from 'expo';
import {
  VideoAnalysisResult,
  ExpoVideoAnalyzerModuleEvents,
} from './ExpoVideoAnalyzer.types';
declare class ExpoVideoAnalyzerModule extends NativeModule<ExpoVideoAnalyzerModuleEvents> {
  analyzeVideo(videoUri: string): Promise<VideoAnalysisResult>;
  hello(): string;
}

export default requireNativeModule<ExpoVideoAnalyzerModule>(
  'ExpoVideoAnalyzer'
);
