import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

/**
 * Custom hook to handle prompt enhancement with API integration
 */
export default function usePromptEnhancement() {
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Enhance a prompt using the API
   * @param prompt Main prompt to enhance
   * @param systemPrompt Optional system prompt to incorporate
   * @param onSuccess Callback with enhanced prompt
   */
  const enhancePrompt = async (
    prompt: string,
    systemPrompt: string = '',
    onSuccess: (enhancedPrompt: string, enhancedSystemPrompt: string) => void
  ) => {
    if (!prompt.trim()) {
      Alert.alert(
        'Description manquante',
        'Veuillez entrer une description à améliorer.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setEnhancing(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const requestBody: any = { prompt: prompt.trim() };

      // Include system prompt if provided
      if (systemPrompt.trim()) {
        requestBody.systemPrompt = systemPrompt.trim();
      }

      const response = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enhance prompt');
      }

      // Call success callback with enhanced content
      onSuccess(
        result.data.enhanced,
        result.data.enhancedSystemPrompt || systemPrompt
      );
    } catch (err) {
      console.error('Error enhancing prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
    } finally {
      setEnhancing(false);
    }
  };

  return {
    enhancing,
    error,
    enhancePrompt,
  };
}
