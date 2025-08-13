import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';

// Mock Expo modules that aren't compatible with Jest
jest.mock('expo-audio', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    record: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue('file://mock-recording.m4a'),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true }),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  }),
  useAudioPlayer: () => ({
    playing: false,
    replace: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  }),
  AudioModule: {
    setAudioMode: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: jest.fn().mockReturnValue(['(onboarding)']),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Stack: {
    Screen: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Clean up after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
}); 