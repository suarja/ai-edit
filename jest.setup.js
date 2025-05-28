import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';

// Mock Expo modules that aren't compatible with Jest
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          getURI: jest.fn().mockReturnValue('file://mock-recording.m4a'),
          getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true }),
          stopAndUnloadAsync: jest.fn(),
        },
      }),
      requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
      setAudioModeAsync: jest.fn(),
    },
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