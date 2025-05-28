import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';

describe('ProgressBar', () => {
  const steps = [
    'welcome',
    'survey',
    'voice-recording',
    'editorial-profile',
    'features',
  ] as const;

  it('renders with correct number of steps', () => {
    const { getAllByTestId } = render(
      <ProgressBar
        steps={steps}
        currentStep="welcome"
        completedSteps={[]}
      />
    );

    const stepIndicators = getAllByTestId('step-indicator');
    expect(stepIndicators.length).toBe(steps.length);
  });

  it('highlights the current step', () => {
    const { getAllByTestId } = render(
      <ProgressBar
        steps={steps}
        currentStep="survey"
        completedSteps={['welcome']}
      />
    );

    const currentStepIndicator = getAllByTestId('step-indicator')[1];
    const currentStepStyle = currentStepIndicator.props.style;
    
    // Check if it has the current step styling (larger width and height)
    expect(currentStepStyle.some(style => style.width === 14 && style.height === 14)).toBe(true);
  });

  it('shows completed steps as filled', () => {
    const completedSteps = ['welcome', 'survey'];
    const { getAllByTestId } = render(
      <ProgressBar
        steps={steps}
        currentStep="voice-recording"
        completedSteps={completedSteps}
      />
    );

    const stepIndicators = getAllByTestId('step-indicator');
    
    // Check if the first two steps (welcome and survey) have the completed style
    expect(stepIndicators[0].props.style.some(style => style.backgroundColor === '#007AFF')).toBe(true);
    expect(stepIndicators[1].props.style.some(style => style.backgroundColor === '#007AFF')).toBe(true);
    
    // The third step should be current, not completed
    expect(stepIndicators[2].props.style.some(style => 
      style.width === 14 && style.height === 14 && style.backgroundColor === '#007AFF'
    )).toBe(true);
  });

  it('renders the correct number of connectors', () => {
    const { getAllByTestId } = render(
      <ProgressBar
        steps={steps}
        currentStep="welcome"
        completedSteps={[]}
      />
    );

    const connectors = getAllByTestId('step-connector');
    // There should be steps.length - 1 connectors
    expect(connectors.length).toBe(steps.length - 1);
  });
}); 