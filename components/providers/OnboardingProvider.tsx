import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

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

// Step order
const STEP_ORDER: OnboardingStep[] = [
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

export const OnboardingProvider = ({
  children,
  initialStep = 'welcome',
  initialCompletedSteps = [],
  initialSurveyAnswers = {},
}: OnboardingProviderProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>(
    initialCompletedSteps
  );
  const [surveyAnswers, setSurveyAnswers] =
    useState<SurveyAnswers>(initialSurveyAnswers);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true);

  const nextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStepInOrder = STEP_ORDER[currentIndex + 1];

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      router.push(STEP_PATHS[nextStepInOrder]);
      setCurrentStep(nextStepInOrder);
    }
  };

  const previousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (currentIndex > 0) {
      const prevStepInOrder = STEP_ORDER[currentIndex - 1];

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }

      router.push(STEP_PATHS[prevStepInOrder]);
      setCurrentStep(prevStepInOrder);
    }
  };

  const jumpToStep = (step: OnboardingStep) => {
    if (STEP_ORDER.includes(step)) {
      router.push(STEP_PATHS[step]);
      setCurrentStep(step);
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
