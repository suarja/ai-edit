import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { features } from '../../lib/config/features';

// Step types
export type OnboardingStep =
  | 'welcome'
  | 'survey'
  | 'voice-recording'
  | 'processing'
  | 'editorial-profile'
  | 'features'
  | 'trial-offer'
  | 'subscription'
  | 'success';

// Survey answer types
export type SurveyAnswers = {
  [key: string]: string;
};

// Context type
interface OnboardingContextType {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  surveyAnswers: SurveyAnswers;
  nextStep: () => void;
  previousStep: () => void;
  jumpToStep: (step: OnboardingStep) => void;
  markStepCompleted: (step: OnboardingStep) => void;
  setSurveyAnswer: (questionId: string, answerId: string) => void;
  autoProgressEnabled: boolean;
  setAutoProgressEnabled: (enabled: boolean) => void;
  isAutoProgressAllowed: (step: OnboardingStep) => boolean;
  visibleSteps: OnboardingStep[];
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

// Context provider props
interface OnboardingProviderProps {
  children: ReactNode;
  initialStep?: OnboardingStep;
  initialCompletedSteps?: OnboardingStep[];
  initialSurveyAnswers?: SurveyAnswers;
}

// Screens that should not auto-advance
const MANUAL_ADVANCE_SCREENS: OnboardingStep[] = [
  'features',
  'trial-offer',
  'subscription',
];

// Full step order
const FULL_STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'survey',
  'voice-recording',
  'processing',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

// Step to path mapping
const STEP_PATHS: Record<OnboardingStep, string> = {
  welcome: '/(onboarding)/welcome',
  survey: '/(onboarding)/survey',
  'voice-recording': '/(onboarding)/voice-recording',
  processing: '/(onboarding)/processing',
  'editorial-profile': '/(onboarding)/editorial-profile',
  features: '/(onboarding)/features',
  'trial-offer': '/(onboarding)/trial-offer',
  subscription: '/(onboarding)/subscription',
  success: '/(onboarding)/success',
};

// Subscription-related steps
const SUBSCRIPTION_STEPS: OnboardingStep[] = ['trial-offer', 'subscription'];

export const OnboardingProvider = ({
  children,
  initialStep = 'welcome',
  initialCompletedSteps = [],
  initialSurveyAnswers = {},
}: OnboardingProviderProps) => {
  // Filter steps based on feature flags
  const visibleSteps = FULL_STEP_ORDER.filter((step) => {
    if (
      SUBSCRIPTION_STEPS.includes(step) &&
      !features.enableSubscriptionScreens
    ) {
      return false;
    }
    return true;
  });

  // Ensure initial step is valid
  const safeInitialStep = visibleSteps.includes(initialStep)
    ? initialStep
    : visibleSteps[0];

  const [currentStep, setCurrentStep] =
    useState<OnboardingStep>(safeInitialStep);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>(
    initialCompletedSteps
  );
  const [surveyAnswers, setSurveyAnswers] =
    useState<SurveyAnswers>(initialSurveyAnswers);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(false);

  // Check if current screen should allow auto-progress
  const isAutoProgressAllowed = (step: OnboardingStep): boolean => {
    // If auto-progress is globally disabled via feature flag, return false
    if (features.disableAutoProgress) {
      return false;
    }
    // Otherwise check if the step is in the manual advance list
    return !MANUAL_ADVANCE_SCREENS.includes(step);
  };

  const nextStep = () => {
    const currentIndex = visibleSteps.indexOf(currentStep);

    if (currentIndex < visibleSteps.length - 1) {
      const nextStepInOrder = visibleSteps[currentIndex + 1];

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Navigate to the next screen
      router.push(STEP_PATHS[nextStepInOrder] as any);
      setCurrentStep(nextStepInOrder);
    }
  };

  const previousStep = () => {
    const currentIndex = visibleSteps.indexOf(currentStep);

    if (currentIndex > 0) {
      const prevStepInOrder = visibleSteps[currentIndex - 1];

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Navigate to the previous screen
      router.push(STEP_PATHS[prevStepInOrder] as any);
      setCurrentStep(prevStepInOrder);
    }
  };

  const jumpToStep = (step: OnboardingStep) => {
    if (visibleSteps.includes(step)) {
      router.push(STEP_PATHS[step] as any);
      setCurrentStep(step);
    } else {
      console.warn(`Attempted to jump to disabled step: ${step}`);
    }
  };

  const markStepCompleted = (step: OnboardingStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const setSurveyAnswer = (questionId: string, answerId: string) => {
    setSurveyAnswers({
      ...surveyAnswers,
      [questionId]: answerId,
    });
  };

  const value = {
    currentStep,
    completedSteps,
    surveyAnswers,
    nextStep,
    previousStep,
    jumpToStep,
    markStepCompleted,
    setSurveyAnswer,
    autoProgressEnabled,
    setAutoProgressEnabled,
    isAutoProgressAllowed,
    visibleSteps,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);

  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }

  return context;
};
