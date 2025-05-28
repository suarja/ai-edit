import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Survey } from '../../../components/onboarding/Survey';
import { mockSurveyQuestions } from '../../utils/test-utils';

describe('Survey', () => {
  const mockQuestion = mockSurveyQuestions[0];
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the question correctly', () => {
    const { getByText } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    expect(getByText(mockQuestion.question)).toBeTruthy();
  });

  it('renders all options', () => {
    const { getByText } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    mockQuestion.options.forEach((option) => {
      expect(getByText(option.text)).toBeTruthy();
    });
  });

  it('allows selecting an option', () => {
    const { getAllByTestId } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    const optionCards = getAllByTestId('option-card');
    fireEvent.press(optionCards[0]);

    // Check if the option is selected
    const selectedCard = getAllByTestId('option-card')[0];
    const cardStyle = selectedCard.props.style;

    // Check for selected container style - style can be an object or an array
    if (Array.isArray(cardStyle)) {
      expect(
        cardStyle.some((style) => style && style.backgroundColor === '#004C99')
      ).toBe(true);
    } else {
      expect(cardStyle.backgroundColor).toBe('#004C99');
    }
  });

  it('calls onAnswer when an option is selected', () => {
    const { getAllByTestId } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    const optionCards = getAllByTestId('option-card');
    fireEvent.press(optionCards[1]);

    expect(mockOnAnswer).toHaveBeenCalledWith(mockQuestion.options[1].id);
  });

  it('continues button is disabled when no option selected', () => {
    const { getByTestId } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    const continueButton = getByTestId('continue-button');
    expect(continueButton.props.accessibilityState.disabled).toBe(true);
  });

  it('enables continue button when an option is selected', () => {
    const { getByTestId, getAllByTestId } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
      />
    );

    const optionCards = getAllByTestId('option-card');
    fireEvent.press(optionCards[0]);

    const continueButton = getByTestId('continue-button');
    expect(continueButton.props.accessibilityState.disabled).toBe(false);
  });

  it('pre-selects the option when selectedOption is provided', () => {
    const selectedOptionId = mockQuestion.options[2].id;
    const { getAllByTestId } = render(
      <Survey
        question={mockQuestion.question}
        options={mockQuestion.options}
        onAnswer={mockOnAnswer}
        selectedOption={selectedOptionId}
      />
    );

    const optionCards = getAllByTestId('option-card');
    const selectedCard = optionCards[2];
    const cardStyle = selectedCard.props.style;

    // Check for selected container style - style can be an object or an array
    if (Array.isArray(cardStyle)) {
      expect(
        cardStyle.some((style) => style && style.backgroundColor === '#004C99')
      ).toBe(true);
    } else {
      expect(cardStyle.backgroundColor).toBe('#004C99');
    }
  });
});
