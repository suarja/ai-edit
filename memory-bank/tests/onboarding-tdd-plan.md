# TDD Plan: Onboarding Flow

## Overview

This document outlines the Test-Driven Development (TDD) approach for implementing the enhanced onboarding flow. We'll follow the standard TDD cycle: write failing tests first, implement the code to make the tests pass, then refactor as needed.

## Testing Infrastructure

### 1. Testing Libraries & Setup

```typescript
// package.json dependencies
{
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.0.0",
    "jest": "^29.0.0",
    "jest-expo": "^49.0.0",
    "react-test-renderer": "^18.0.0"
  }
}
```

### 2. Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)',
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './jest.setup.js',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
};
```

### 3. Test Setup File

```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';

// Mock Expo modules that aren't compatible with Jest
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          getURI: jest.fn().mockReturnValue('file://mock-recording.m4a'),
          getStatusAsync: jest
            .fn()
            .mockResolvedValue({ isDoneRecording: true }),
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
  },
}));

// Clean up after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
```

## Test Files Structure

We'll organize our tests to mirror the structure of our components:

```
__tests__/
  components/
    onboarding/
      ProgressBar.test.tsx
      Survey.test.tsx
      OptionCard.test.tsx
      ProcessingScreen.test.tsx
      SubscriptionCard.test.tsx
  screens/
    onboarding/
      Welcome.test.tsx
      SurveyScreen.test.tsx
      VoiceRecording.test.tsx
      EditorialPreview.test.tsx
      FeaturesShowcase.test.tsx
      TrialOffer.test.tsx
      Subscription.test.tsx
      Success.test.tsx
  providers/
    OnboardingProvider.test.tsx
```

## Component Testing Plan

### 1. OnboardingProvider

```typescript
// OnboardingProvider.test.tsx
describe('OnboardingProvider', () => {
  test('provides initial state with default values', () => {
    // Test that the provider initializes with default state
  });

  test('advances to the next step when nextStep is called', () => {
    // Test step progression
  });

  test('stores survey answers correctly', () => {
    // Test survey answer storage
  });

  test('tracks completed steps correctly', () => {
    // Test step completion tracking
  });

  test('allows navigation to a specific step', () => {
    // Test direct navigation to steps
  });
});
```

### 2. ProgressBar Component

```typescript
// ProgressBar.test.tsx
describe('ProgressBar', () => {
  test('renders with correct number of steps', () => {
    // Test step count visualization
  });

  test('highlights the current step', () => {
    // Test current step indicator
  });

  test('shows completed steps as filled', () => {
    // Test completed step visualization
  });

  test('adjusts to different screen widths', () => {
    // Test responsiveness
  });
});
```

### 3. Survey Component

```typescript
// Survey.test.tsx
describe('Survey', () => {
  test('renders the question correctly', () => {
    // Test question display
  });

  test('renders all options', () => {
    // Test options rendering
  });

  test('allows selecting an option', () => {
    // Test option selection
  });

  test('calls onAnswer when an option is selected', () => {
    // Test callback firing
  });

  test('disables continue button when no option selected', () => {
    // Test validation
  });
});
```

### 4. Welcome Screen

```typescript
// Welcome.test.tsx
describe('Welcome Screen', () => {
  test('renders title and subtitle', () => {
    // Test basic content
  });

  test('shows get started button', () => {
    // Test CTA button
  });

  test('navigates to survey on button press', () => {
    // Test navigation
  });
});
```

### 5. Voice Recording Screen

```typescript
// VoiceRecording.test.tsx
describe('Voice Recording Screen', () => {
  test('shows recording instructions', () => {
    // Test instructions display
  });

  test('shows recording button', () => {
    // Test recording UI
  });

  test('changes UI when recording starts', () => {
    // Test recording state
  });

  test('shows processing state after recording stops', () => {
    // Test processing state
  });

  test('handles recording errors', () => {
    // Test error handling
  });

  test('navigates after successful processing', () => {
    // Test successful flow
  });
});
```

## Integration Testing Plan

```typescript
// OnboardingFlow.test.tsx
describe('Onboarding Flow Integration', () => {
  test('completes full onboarding journey', async () => {
    // Test full happy path from welcome to completion
  });

  test('handles skipping optional steps', async () => {
    // Test partial flows
  });

  test('preserves state between steps', async () => {
    // Test state persistence
  });

  test('handles going back to previous steps', async () => {
    // Test backwards navigation
  });
});
```

## Mock Data

```typescript
// mocks/onboardingData.ts
export const mockSurveyQuestions = [
  {
    id: 'content_goals',
    question: "What's your primary goal with video content?",
    options: [
      { id: 'brand', text: 'Build brand awareness' },
      { id: 'sales', text: 'Drive sales and conversions' },
      { id: 'educate', text: 'Educate my audience' },
      { id: 'entertain', text: 'Entertain and engage followers' },
      { id: 'expertise', text: 'Share my expertise' },
    ],
  },
  // Additional questions...
];

export const mockSubscriptionPlans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    features: [
      '3 videos per month',
      'Basic templates only',
      'Standard voice options',
      '720p resolution',
    ],
  },
  // Additional plans...
];
```

## Test Utilities

```typescript
// utils/test-utils.tsx
import { render } from '@testing-library/react-native';
import { OnboardingProvider } from '../../components/providers/OnboardingProvider';

export function renderWithOnboardingProvider(ui, options = {}) {
  const { initialStep = 0, ...restOptions } = options;

  return render(
    <OnboardingProvider initialStep={initialStep}>{ui}</OnboardingProvider>,
    restOptions
  );
}
```

## Implementation Order

1. Set up testing infrastructure
2. Create and test OnboardingProvider (state management)
3. Create and test reusable components (ProgressBar, Survey, etc.)
4. Implement and test individual screens
5. Create integration tests for complete flow
6. Implement backend integration with proper mocks

## Continuous Integration

Configure CI to run tests on pull requests and main branch updates:

```yaml
# .github/workflows/test.yml
name: Test Suite
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
```

## Next Steps

1. Create the basic test setup files
2. Implement and test the OnboardingProvider component
3. Build and test the ProgressBar component
4. Develop the Survey component with tests
