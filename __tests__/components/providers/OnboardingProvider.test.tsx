import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import {
  OnboardingProvider,
  useOnboarding,
  OnboardingStep,
} from '../../../components/providers/OnboardingProvider';
import { Text } from 'react-native';

describe('OnboardingProvider', () => {
  const TestComponent = () => {
    const { currentStep } = useOnboarding();
    return <Text testID="current-step">{currentStep}</Text>;
  };

  it('provides initial state with default values', () => {
    const { getByTestId } = render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const stepText = getByTestId('current-step');
    expect(stepText.props.children).toBe('welcome');
  });

  it('provides initial state with custom values', () => {
    const { getByTestId } = render(
      <OnboardingProvider initialStep="survey">
        <TestComponent />
      </OnboardingProvider>
    );

    const stepText = getByTestId('current-step');
    expect(stepText.props.children).toBe('survey');
  });

  it('advances to the next step when nextStep is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider initialStep="welcome">{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe('survey');
  });

  it('navigates to the previous step when previousStep is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider initialStep="survey">{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe('welcome');
  });

  it('stores survey answers correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.setSurveyAnswer('content_goals', 'brand');
    });

    expect(result.current.surveyAnswers).toEqual({
      content_goals: 'brand',
    });

    act(() => {
      result.current.setSurveyAnswer('pain_points', 'time');
    });

    expect(result.current.surveyAnswers).toEqual({
      content_goals: 'brand',
      pain_points: 'time',
    });
  });

  it('tracks completed steps correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.markStepCompleted('welcome');
    });

    expect(result.current.completedSteps).toEqual(['welcome']);

    act(() => {
      result.current.markStepCompleted('survey');
    });

    expect(result.current.completedSteps).toEqual(['welcome', 'survey']);

    // Should not add duplicates
    act(() => {
      result.current.markStepCompleted('welcome');
    });

    expect(result.current.completedSteps).toEqual(['welcome', 'survey']);
  });

  it('allows navigation to a specific step', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider initialStep="welcome">{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.goToStep('voice-recording');
    });

    expect(result.current.currentStep).toBe('voice-recording');
  });
}); 