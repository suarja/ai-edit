import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ProcessingScreen } from '../../../components/onboarding/ProcessingScreen';

// Mock timers
jest.useFakeTimers();

// Mock Haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

describe('ProcessingScreen', () => {
  const mockTitle = 'Processing';
  const mockMessage = 'Please wait while we set up your profile';
  const mockSteps = [
    'Analyzing your preferences',
    'Creating your voice profile',
    'Setting up your account',
  ];
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct title and message', () => {
    const { getByText } = render(
      <ProcessingScreen
        title={mockTitle}
        message={mockMessage}
        steps={mockSteps}
      />
    );

    expect(getByText(mockTitle)).toBeTruthy();
    expect(getByText(mockMessage)).toBeTruthy();
  });

  it('renders all steps', () => {
    const { getByText } = render(
      <ProcessingScreen
        title={mockTitle}
        message={mockMessage}
        steps={mockSteps}
      />
    );

    mockSteps.forEach((step) => {
      expect(getByText(step)).toBeTruthy();
    });
  });

  it('advances through steps automatically', () => {
    const { getByText } = render(
      <ProcessingScreen
        title={mockTitle}
        message={mockMessage}
        steps={mockSteps}
      />
    );

    // First step is active initially
    let firstStepElement = getByText(mockSteps[0]);
    expect(firstStepElement.parent.parent.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#00366B' })
    );

    // Advance to the second step
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Second step should now be active
    let secondStepElement = getByText(mockSteps[1]);
    expect(secondStepElement.parent.parent.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#00366B' })
    );

    // First step should be marked as completed
    expect(firstStepElement.parent.parent.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#004C99' })
    );

    // Advance to the third step
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Third step should now be active
    let thirdStepElement = getByText(mockSteps[2]);
    expect(thirdStepElement.parent.parent.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#00366B' })
    );
  });

  it('calls onComplete when autoComplete is true', () => {
    render(
      <ProcessingScreen
        title={mockTitle}
        message={mockMessage}
        steps={mockSteps}
        onComplete={mockOnComplete}
        autoComplete={true}
        completionDelay={500}
      />
    );

    // Advance through all steps
    act(() => {
      jest.advanceTimersByTime(1500 * (mockSteps.length - 1));
    });

    // Wait for completion delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });
});
