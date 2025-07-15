import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoVideoAnalyzerModule extends NativeModule<{}> {
}

export default requireNativeModule<ExpoVideoAnalyzerModule>('ExpoVideoAnalyzer');