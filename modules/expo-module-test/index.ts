// Reexport the native module. On web, it will be resolved to ExpoModuleTestModule.web.ts
// and on native platforms to ExpoModuleTestModule.ts
export { default } from './src/ExpoModuleTestModule';
export { default as ExpoModuleTestView } from './src/ExpoModuleTestView';
export * from  './src/ExpoModuleTest.types';
