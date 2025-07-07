import {
  OnboardingStep,
  useOnboarding,
} from '@/components/providers/OnboardingProvider';

/**
 * Hook to get the filtered list of onboarding steps based on feature flags.
 * The single source of truth for the step order is in OnboardingProvider.
 * @returns Array of visible onboarding steps
 */
export const useOnboardingSteps = (): OnboardingStep[] => {
  const { visibleSteps } = useOnboarding();
  return visibleSteps;
};
