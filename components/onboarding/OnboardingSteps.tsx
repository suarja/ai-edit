import {
  OnboardingStep,
  useOnboarding,
} from '@/components/providers/OnboardingProvider';

// Full list of all possible onboarding steps
export const FULL_ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'survey',
  'voice-recording',
  'tiktok-analysis',
  'processing',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

/**
 * Hook to get the filtered list of onboarding steps based on feature flags
 * @returns Array of visible onboarding steps
 */
export const useOnboardingSteps = (): OnboardingStep[] => {
  try {
    const { visibleSteps } = useOnboarding();
    return visibleSteps;
  } catch (error) {
    console.error(
      'useOnboardingSteps must be used within an OnboardingProvider. Returning default steps.'
    );
    // Return default steps if outside provider
    return FULL_ONBOARDING_STEPS;
  }
};
