import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OptionCard } from '../../../components/onboarding/OptionCard';

describe('OptionCard', () => {
  const mockText = 'Test option';
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct text', () => {
    const { getByText } = render(
      <OptionCard text={mockText} selected={false} onSelect={mockOnSelect} />
    );

    expect(getByText(mockText)).toBeTruthy();
  });

  it('applies selected styles when selected is true', () => {
    const { getByTestId } = render(
      <OptionCard text={mockText} selected={true} onSelect={mockOnSelect} />
    );

    const card = getByTestId('option-card');
    const cardStyle = card.props.style;

    // Check for selected container style - style can be an object or an array
    if (Array.isArray(cardStyle)) {
      expect(
        cardStyle.some((style) => style && style.backgroundColor === '#004C99')
      ).toBe(true);
    } else {
      expect(cardStyle.backgroundColor).toBe('#004C99');
    }
  });

  it('shows check icon when selected', () => {
    const { queryByTestId } = render(
      <OptionCard text={mockText} selected={true} onSelect={mockOnSelect} />
    );

    expect(queryByTestId('check-icon')).toBeTruthy();
  });

  it('does not show check icon when not selected', () => {
    const { queryByTestId } = render(
      <OptionCard text={mockText} selected={false} onSelect={mockOnSelect} />
    );

    expect(queryByTestId('check-icon')).toBeNull();
  });

  it('calls onSelect when pressed', () => {
    const { getByTestId } = render(
      <OptionCard text={mockText} selected={false} onSelect={mockOnSelect} />
    );

    const card = getByTestId('option-card');
    fireEvent.press(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});
