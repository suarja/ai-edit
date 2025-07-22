/**
 * INDEX ONBOARDING SYSTEM
 * 
 * Point d'entrée central pour le système d'onboarding informatif
 * Simplifie les imports dans votre application
 */

// Services
export { OnboardingService } from '../services/onboardingService';
export type { OnboardingState } from '../services/onboardingService';

// Types
export type { OnboardingStep, StepContent } from '../types/onboarding.types';

// Configuration
export { 
  ONBOARDING_STEPS,
  STEP_ROUTES,
  CONVERSION_MESSAGES,
  getStepContent,
  getStepRoute,
  getTotalSteps 
} from '../config/onboarding-steps';

// Hook principal
export { useOnboarding } from '../../app/hooks/useOnboarding';

// Composants
export { OnboardingOverlay } from '../../components/onboarding/OnboardingOverlay';

/**
 * UTILISATION SIMPLIFIÉE
 * 
 * Au lieu de multiples imports :
 * import { OnboardingService } from '@/lib/services/onboardingService';
 * import { useOnboarding } from '@/app/hooks/useOnboarding';
 * import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
 * 
 * Utilisez un seul import :
 * import { OnboardingService, useOnboarding, OnboardingOverlay } from '@/lib/onboarding';
 */