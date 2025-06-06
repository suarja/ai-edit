import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import PromptInput from '@/app/components/PromptInput';

// Mock the usePromptEnhancement hook
const mockPromptEnhancement = {
  enhancing: false,
  enhancePrompt: jest.fn(),
  enhanceSystemPrompt: jest.fn(),
  generateSystemPrompt: jest.fn(),
  undoPrompt: jest.fn(),
  redoPrompt: jest.fn(),
  canUndo: jest.fn(),
  canRedo: jest.fn(),
  trackPromptChange: jest.fn(),
  saveToHistory: jest.fn(),
};

jest.mock('@/app/hooks/usePromptEnhancement', () => ({
  usePromptEnhancement: () => mockPromptEnhancement,
}));

describe('PromptInput Component', () => {
  const defaultProps = {
    prompt: '',
    systemPrompt: '',
    onPromptChange: jest.fn(),
    onSystemPromptChange: jest.fn(),
    outputLanguage: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPromptEnhancement.canUndo.mockReturnValue(false);
    mockPromptEnhancement.canRedo.mockReturnValue(false);
  });

  test('renders correctly with default props', () => {
    const { getByText } = render(<PromptInput {...defaultProps} />);
    expect(getByText('Description')).toBeTruthy();
  });

  test('displays word count correctly', () => {
    const { getByText } = render(
      <PromptInput {...defaultProps} prompt="This is a test prompt" />
    );
    expect(getByText(/5 mots/)).toBeTruthy();
  });

  test('calls onPromptChange when text changes', () => {
    const onPromptChange = jest.fn();
    const { getByDisplayValue } = render(
      <PromptInput {...defaultProps} onPromptChange={onPromptChange} />
    );
    
    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, 'New text');
    
    expect(onPromptChange).toHaveBeenCalledWith('New text');
  });
}); 