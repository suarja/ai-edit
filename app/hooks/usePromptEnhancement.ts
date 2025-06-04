import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

/**
 * Custom hook to handle prompt enhancement with API integration
 */
export function usePromptEnhancement() {
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);

  /**
   * Enhance a prompt using the API
   * @param prompt Main prompt to enhance
   * @param outputLanguage Language of the enhanced prompt
   * @returns Enhanced prompt
   */
  const enhancePrompt = async (
    prompt: string,
    outputLanguage: string
  ): Promise<string> => {
    try {
      setEnhancing(true);
      setEnhancementError(null);

      if (!prompt.trim()) {
        return '';
      }

      console.log('Enhancing prompt...');
      const response = await fetch('/api/prompts/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: prompt,
          outputLanguage: outputLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const result = await response.json();
      console.log('Prompt enhanced');
      return result.enhancedPrompt;
    } catch (err) {
      console.error('Error enhancing prompt:', err);
      setEnhancementError(
        err instanceof Error ? err.message : 'Unknown error enhancing prompt'
      );
      return prompt; // Return original prompt on error
    } finally {
      setEnhancing(false);
    }
  };

  /**
   * Enhance a system prompt using the API
   * @param systemPrompt System prompt to enhance
   * @param mainPrompt Main prompt to incorporate
   * @param outputLanguage Language of the enhanced system prompt
   * @returns Enhanced system prompt
   */
  const enhanceSystemPrompt = async (
    systemPrompt: string,
    mainPrompt: string,
    outputLanguage: string
  ): Promise<string> => {
    try {
      setEnhancing(true);
      setEnhancementError(null);

      if (!systemPrompt.trim() || !mainPrompt.trim()) {
        return systemPrompt;
      }

      console.log('Enhancing system prompt...');
      const response = await fetch('/api/prompts/enhance-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: systemPrompt,
          mainPrompt: mainPrompt,
          outputLanguage: outputLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance system prompt');
      }

      const result = await response.json();
      console.log('System prompt enhanced');
      return result.enhancedPrompt;
    } catch (err) {
      console.error('Error enhancing system prompt:', err);
      setEnhancementError(
        err instanceof Error
          ? err.message
          : 'Unknown error enhancing system prompt'
      );
      return systemPrompt; // Return original system prompt on error
    } finally {
      setEnhancing(false);
    }
  };

  /**
   * Generate a system prompt using the API
   * @param mainPrompt Main prompt to generate system prompt for
   * @param outputLanguage Language of the generated system prompt
   * @returns Generated system prompt
   */
  const generateSystemPrompt = async (
    mainPrompt: string,
    outputLanguage: string
  ): Promise<string> => {
    try {
      setEnhancing(true);
      setEnhancementError(null);

      if (!mainPrompt.trim()) {
        return '';
      }

      console.log('Generating system prompt...');
      const response = await fetch('/api/prompts/generate-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainPrompt: mainPrompt,
          outputLanguage: outputLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate system prompt');
      }

      const result = await response.json();
      console.log('System prompt generated');
      return result.generatedPrompt;
    } catch (err) {
      console.error('Error generating system prompt:', err);
      setEnhancementError(
        err instanceof Error
          ? err.message
          : 'Unknown error generating system prompt'
      );
      return ''; // Return empty string on error
    } finally {
      setEnhancing(false);
    }
  };

  return {
    enhancing,
    enhancementError,
    enhancePrompt,
    enhanceSystemPrompt,
    generateSystemPrompt,
  };
}
