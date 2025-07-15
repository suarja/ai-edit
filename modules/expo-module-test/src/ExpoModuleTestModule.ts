import { NativeModule, requireNativeModule } from 'expo';

import { ExpoModuleTestModuleEvents } from './ExpoModuleTest.types';

declare class ExpoModuleTestModule extends NativeModule<ExpoModuleTestModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoModuleTestModule>('ExpoModuleTest');
