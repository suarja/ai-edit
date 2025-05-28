import React, { createContext, useContext, useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

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

type SurveyAnswers = {
  [key: string]: string;
};

interface OnboardingContextValue {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  surveyAnswers: SurveyAnswers;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  setSurveyAnswer: (questionId: string, answer: string) => void;
  markStepCompleted: (step: OnboardingStep) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

// Define the step sequence for navigation
const STEP_SEQUENCE: OnboardingStep[] = [
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

export interface OnboardingProviderProps {
  children: React.ReactNode;
  initialStep?: OnboardingStep;
  initialCompletedSteps?: OnboardingStep[];
  initialSurveyAnswers?: SurveyAnswers;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  initialStep = 'welcome',
  initialCompletedSteps = [],
  initialSurveyAnswers = {},
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>(
    initialCompletedSteps
  );
  const [surveyAnswers, setSurveyAnswers] =
    useState<SurveyAnswers>(initialSurveyAnswers);

  // Step navigation functions
  const nextStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex < STEP_SEQUENCE.length - 1) {
      const nextStepValue = STEP_SEQUENCE[currentIndex + 1];
      setCurrentStep(nextStepValue);

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Navigate to the next screen using Expo Router
      router.push(`/(onboarding)/${nextStepValue}`);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepValue = STEP_SEQUENCE[currentIndex - 1];
      setCurrentStep(prevStepValue);

      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Navigate to the previous screen using Expo Router
      router.push(`/(onboarding)/${prevStepValue}`);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);

    // Navigate to the specific screen using Expo Router
    router.push(`/(onboarding)/${step}`);
  }, []);

  // Survey answer management
  const setSurveyAnswer = useCallback((questionId: string, answer: string) => {
    setSurveyAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  // Step completion tracking
  const markStepCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        completedSteps,
        surveyAnswers,
        nextStep,
        previousStep,
        goToStep,
        setSurveyAnswer,
        markStepCompleted,
      }}
    >
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
