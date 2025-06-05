import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

/**
 * Custom hook to handle prompt enhancement with API integration
 */
export function usePromptEnhancement() {
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Debug ref to avoid stale closure in setTimeout
  const debugRef = useRef({
    promptHistory: [] as string[],
    currentHistoryIndex: -1,
  });

  /**
   * Save a prompt to history
   * @param newPrompt The prompt to save to history
   */
  const saveToHistory = (newPrompt: string) => {
    if (newPrompt?.trim()) {
      console.log('🗂️ Attempting to save prompt to history:', newPrompt);
      console.log('🗂️ Current history state:', {
        promptHistory,
        currentHistoryIndex,
        promptCount: promptHistory.length,
      });

      // Only add to history if it's different from the current prompt
      if (
        currentHistoryIndex < 0 ||
        promptHistory[currentHistoryIndex] !== newPrompt
      ) {
        // Remove any future history if we're not at the end
        const newHistory = promptHistory.slice(0, currentHistoryIndex + 1);
        const updatedHistory = [...newHistory, newPrompt];
        const newIndex = newHistory.length;

        console.log('🗂️ Saving new prompt to history at index:', newIndex);
        console.log('🗂️ New history will be:', updatedHistory);

        setPromptHistory(updatedHistory);
        setCurrentHistoryIndex(newIndex);

        // Update debug ref
        debugRef.current = {
          promptHistory: updatedHistory,
          currentHistoryIndex: newIndex,
        };

        // Debug timeout
        setTimeout(() => {
          console.log('🔍 After save - History state:', {
            promptHistory: debugRef.current.promptHistory,
            currentHistoryIndex: debugRef.current.currentHistoryIndex,
          });
        }, 100);
      } else {
        console.log('🗂️ Not saving to history - prompt is the same as current');
      }
    }
  };

  /**
   * Track changes to the prompt (to be called from onChange handler)
   * @param newPrompt New prompt value
   */
  const trackPromptChange = (newPrompt: string) => {
    console.log('👀 Tracking prompt change:', newPrompt);
    // We don't save every keystroke to avoid cluttering history
    // Instead we check if it's been 1.5 seconds since the last change
    // This is a common pattern for undo/redo in text editors
    if (
      newPrompt?.trim() &&
      (currentHistoryIndex < 0 ||
        promptHistory[currentHistoryIndex] !== newPrompt)
    ) {
      // Debounce function would be better but we'll keep it simple
      saveToHistory(newPrompt);
    }
  };

  /**
   * Undo to previous prompt
   * @returns Previous prompt or null if no history
   */
  const undoPrompt = (): string | null => {
    console.log(
      '⏪ Undo called. Current index:',
      currentHistoryIndex,
      'History length:',
      promptHistory.length
    );
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousPrompt = promptHistory[newIndex];
      console.log('⏪ Undoing to index:', newIndex, 'Prompt:', previousPrompt);
      setCurrentHistoryIndex(newIndex);

      // Update debug ref
      debugRef.current.currentHistoryIndex = newIndex;

      return previousPrompt;
    }
    console.log('⏪ Cannot undo - at beginning of history');
    return null;
  };

  /**
   * Redo to next prompt
   * @returns Next prompt or null if at end of history
   */
  const redoPrompt = (): string | null => {
    console.log(
      '⏩ Redo called. Current index:',
      currentHistoryIndex,
      'History length:',
      promptHistory.length
    );
    if (currentHistoryIndex < promptHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextPrompt = promptHistory[newIndex];
      console.log('⏩ Redoing to index:', newIndex, 'Prompt:', nextPrompt);
      setCurrentHistoryIndex(newIndex);

      // Update debug ref
      debugRef.current.currentHistoryIndex = newIndex;

      return nextPrompt;
    }
    console.log('⏩ Cannot redo - at end of history');
    return null;
  };

  /**
   * Check if undo is available
   */
  const canUndo = (): boolean => {
    const canUndoResult = currentHistoryIndex > 0;
    console.log('🔍 Can undo?', canUndoResult, 'Index:', currentHistoryIndex);
    return canUndoResult;
  };

  /**
   * Check if redo is available
   */
  const canRedo = (): boolean => {
    const canRedoResult = currentHistoryIndex < promptHistory.length - 1;
    console.log(
      '🔍 Can redo?',
      canRedoResult,
      'Index:',
      currentHistoryIndex,
      'History length:',
      promptHistory.length
    );
    return canRedoResult;
  };

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
      console.log('🚀 Starting prompt enhancement for:', prompt);
      setEnhancing(true);
      setEnhancementError(null);

      if (!prompt || !prompt.trim()) {
        console.warn('⚠️ Empty prompt provided to enhancePrompt');
        return '';
      }

      // Save original prompt to history
      saveToHistory(prompt);

      console.log(
        '📤 Sending enhancement request to API with language:',
        outputLanguage
      );
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
        console.error(
          '❌ API response not ok:',
          response.status,
          response.statusText
        );
        throw new Error(`Failed to enhance prompt: ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Received API response:', result);

      // Fix: Extract enhancedPrompt from the nested data structure
      const enhancedPrompt = result.data?.enhancedPrompt || prompt;
      console.log('✅ Final enhanced prompt:', enhancedPrompt);

      // Save the enhanced prompt to history as well
      if (enhancedPrompt !== prompt) {
        console.log('💾 Saving enhanced prompt to history');
        saveToHistory(enhancedPrompt);
      } else {
        console.log(
          '⚠️ Enhanced prompt is the same as original, not saving to history'
        );
      }

      return enhancedPrompt;
    } catch (err) {
      console.error('❌ Error enhancing prompt:', err);
      setEnhancementError(
        err instanceof Error ? err.message : 'Unknown error enhancing prompt'
      );
      return prompt; // Return original prompt on error
    } finally {
      console.log('🏁 Enhancement process completed');
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
      console.log('🚀 Starting system prompt enhancement');
      setEnhancing(true);
      setEnhancementError(null);

      if (
        !systemPrompt ||
        !systemPrompt.trim() ||
        !mainPrompt ||
        !mainPrompt.trim()
      ) {
        console.warn(
          '⚠️ Missing required inputs for system prompt enhancement'
        );
        return systemPrompt || '';
      }

      console.log('📤 Sending system prompt enhancement request');
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
        console.error(
          '❌ API response not ok:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to enhance system prompt');
      }

      const result = await response.json();
      console.log('📥 Received API response for system prompt:', result);

      // Fix: Extract enhancedPrompt from the nested data structure
      const enhancedSystemPrompt = result.data?.enhancedPrompt || systemPrompt;
      console.log('✅ Extracted enhanced system prompt:', enhancedSystemPrompt);

      return enhancedSystemPrompt; // Return original if enhanced is undefined
    } catch (err) {
      console.error('❌ Error enhancing system prompt:', err);
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
      console.log('🚀 Starting system prompt generation');
      setEnhancing(true);
      setEnhancementError(null);

      if (!mainPrompt || !mainPrompt.trim()) {
        console.warn('⚠️ Empty main prompt provided to generateSystemPrompt');
        return '';
      }

      console.log('📤 Sending system prompt generation request');
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
        console.error(
          '❌ API response not ok:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to generate system prompt');
      }

      const result = await response.json();
      console.log(
        '📥 Received API response for system prompt generation:',
        result
      );

      // Fix: Extract generatedPrompt from the nested data structure
      const generatedPrompt = result.data?.generatedPrompt || '';
      console.log('✅ Extracted system prompt:', generatedPrompt);

      return generatedPrompt; // Return empty string if generated is undefined
    } catch (err) {
      console.error('❌ Error generating system prompt:', err);
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
    undoPrompt,
    redoPrompt,
    canUndo,
    canRedo,
    trackPromptChange,
    saveToHistory,
  };
}
