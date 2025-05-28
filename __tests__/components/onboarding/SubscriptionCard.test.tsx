import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubscriptionCard } from '../../../components/onboarding/SubscriptionCard';
import { mockSubscriptionPlans } from '../../utils/test-utils';

describe('SubscriptionCard', () => {
  const mockPlan = mockSubscriptionPlans[1]; // Creator Plan (recommended)
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the plan title correctly', () => {
    const { getByText } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText(mockPlan.title)).toBeTruthy();
  });

  it('renders the plan price correctly', () => {
    const { getByText } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText(`$${mockPlan.price}`)).toBeTruthy();
    expect(getByText(`/${mockPlan.period}`)).toBeTruthy();
  });

  it('renders all features for the plan', () => {
    const { getByText } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    mockPlan.features.forEach((feature) => {
      expect(getByText(feature.text)).toBeTruthy();
    });
  });

  it('shows recommended badge for recommended plans', () => {
    const { getByText, queryByText } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Recommended')).toBeTruthy();

    // Test with non-recommended plan
    const nonRecommendedPlan = { ...mockPlan, isRecommended: false };
    const { queryByText: queryAgain } = render(
      <SubscriptionCard
        plan={nonRecommendedPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(queryAgain('Recommended')).toBeNull();
  });

  it('applies selected styles when isSelected is true', () => {
    const { getByTestId } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    const card = getByTestId('subscription-card');
    const cardStyle = card.props.style;

    // Check for selected container style
    if (Array.isArray(cardStyle)) {
      expect(
        cardStyle.some((style) => style && style.borderColor === '#007AFF')
      ).toBe(true);
      expect(
        cardStyle.some((style) => style && style.backgroundColor === '#00366B')
      ).toBe(true);
    } else {
      expect(cardStyle.borderColor).toBe('#007AFF');
      expect(cardStyle.backgroundColor).toBe('#00366B');
    }
  });

  it('calls onSelect when pressed', () => {
    const { getByTestId } = render(
      <SubscriptionCard
        plan={mockPlan}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = getByTestId('subscription-card');
    fireEvent.press(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});
