import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { OnboardingProvider } from '../../components/providers/OnboardingProvider';
import { OnboardingStep } from '../../components/providers/OnboardingProvider';

interface CustomRenderOptions extends RenderOptions {
  initialStep?: OnboardingStep;
  initialCompletedSteps?: OnboardingStep[];
  initialSurveyAnswers?: Record<string, string>;
}

/**
 * Custom render function that wraps the component with OnboardingProvider
 */
export function renderWithOnboarding(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialStep = 'welcome',
    initialCompletedSteps = [],
    initialSurveyAnswers = {},
    ...renderOptions
  } = options;

  return render(
    <OnboardingProvider
      initialStep={initialStep}
      initialCompletedSteps={initialCompletedSteps}
      initialSurveyAnswers={initialSurveyAnswers}
    >
      {ui}
    </OnboardingProvider>,
    renderOptions
  );
}

/**
 * Mock survey questions for testing
 */
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
  {
    id: 'pain_points',
    question: "What's your biggest challenge with creating videos?",
    options: [
      { id: 'ideas', text: 'Coming up with good ideas' },
      { id: 'scripts', text: 'Writing compelling scripts' },
      { id: 'voiceovers', text: 'Recording professional voiceovers' },
      { id: 'time', text: 'Finding time to create content' },
      { id: 'consistency', text: 'Getting consistent results' },
    ],
  },
];

/**
 * Mock subscription plans for testing
 */
export const mockSubscriptionPlans = [
  {
    id: 'free',
    title: 'Free Tier',
    price: 0,
    period: 'month',
    features: [
      { text: '3 videos per month' },
      { text: 'Basic templates only' },
      { text: 'Standard voice options' },
      { text: '720p resolution' },
    ],
    isRecommended: false,
  },
  {
    id: 'creator',
    title: 'Creator Plan',
    price: 9.99,
    period: 'month',
    features: [
      { text: '15 videos per month' },
      { text: 'All templates' },
      { text: 'Custom voice clone' },
      { text: '1080p resolution' },
      { text: 'Priority processing' },
    ],
    isRecommended: true,
  },
];

// Dummy test to avoid "Your test suite must contain at least one test" error
describe('Test Utils', () => {
  it('exports utility functions', () => {
    expect(typeof renderWithOnboarding).toBe('function');
    expect(Array.isArray(mockSurveyQuestions)).toBe(true);
    expect(Array.isArray(mockSubscriptionPlans)).toBe(true);
  });
});
