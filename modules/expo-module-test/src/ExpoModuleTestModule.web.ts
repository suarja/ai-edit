import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoModuleTest.types';

type ExpoModuleTestModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoModuleTestModule extends NativeModule<ExpoModuleTestModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoModuleTestModule, 'ExpoModuleTestModule');
