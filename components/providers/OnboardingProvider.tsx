import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
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
const SUBSCRIPTION_STEPS: OnboardingStep[] = ['subscription'];
const TRIAL_STEPS: OnboardingStep[] = ['trial-offer'];

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
    if (TRIAL_STEPS.includes(step) && !features.enableTrialOfferScreen) {
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
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const navigationCallCountRef = useRef(0);

  const nextStep = () => {
    // Increment call count for debugging
    navigationCallCountRef.current += 1;
    const callId = navigationCallCountRef.current;

    console.log(
      `nextStep called (call #${callId}), current step: ${currentStep}, isNavigating: ${isNavigating}`
    );

    // Prevent rapid navigation calls with enhanced protection
    if (isNavigating) {
      console.log(
        `Navigation already in progress, ignoring nextStep call #${callId}`
      );
      return;
    }

    const currentIndex = visibleSteps.indexOf(currentStep);

    if (currentIndex < visibleSteps.length - 1) {
      const nextStepInOrder = visibleSteps[currentIndex + 1];
      console.log(
        `Navigation call #${callId}: ${currentStep} → ${nextStepInOrder}`
      );

      setIsNavigating(true);

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Navigate to the next screen immediately
      router.push(STEP_PATHS[nextStepInOrder] as any);
      setCurrentStep(nextStepInOrder);

      // Reset navigation lock with enhanced timeout
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        console.log(`Navigation lock released for call #${callId}`);
      }, 3000); // Extended to 3 seconds for better protection
    } else {
      console.log(
        `Call #${callId}: Already at the last step (${currentStep}), cannot advance further`
      );
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    currentStep,
    completedSteps,
    surveyAnswers,
    nextStep,
    previousStep,
    jumpToStep,
    markStepCompleted,
    setSurveyAnswer,
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
