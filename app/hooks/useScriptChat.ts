import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import {
  ScriptDraft,
  ChatMessage,
  ScriptChatRequest,
  ScriptListItem,
  estimateScriptDuration,
  generateScriptTitle,
} from '@/types/script';
import { API_ENDPOINTS } from '@/lib/config/api';

interface UseScriptChatOptions {
  scriptId?: string;
  outputLanguage?: string;
  editorialProfileId?: string;
}

interface UseScriptChatReturn {
  // State
  scriptDraft: ScriptDraft | null;
  messages: ChatMessage[];
  currentScript: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamingStatus: string | null;

  // Actions
  sendMessage: (message: string) => Promise<void>;
  createNewScript: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  validateScript: () => Promise<void>;
  duplicateScript: () => Promise<ScriptDraft | null>;
  deleteScript: () => Promise<boolean>;
  clearError: () => void;

  // Metadata
  wordCount: number;
  estimatedDuration: number;
  title: string;
}

/**
 * Hook for managing script chat functionality
 * Handles conversation state, streaming, and script management
 */
export function useScriptChat(
  options: UseScriptChatOptions = {}
): UseScriptChatReturn {
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();

  // State
  const [scriptDraft, setScriptDraft] = useState<ScriptDraft | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentScript, setCurrentScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);

  // Refs for streaming
  const streamingMessageRef = useRef<ChatMessage | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize script draft
  useEffect(() => {
    if (options.scriptId) {
      loadScriptDraft(options.scriptId);
    }
  }, [options.scriptId]);

  // Update messages when script draft changes
  useEffect(() => {
    if (scriptDraft) {
      setMessages(scriptDraft.messages || []);
      setCurrentScript(scriptDraft.current_script || '');
    }
  }, [scriptDraft]);

  /**
   * Load existing script draft
   */
  const loadScriptDraft = async (scriptId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.SCRIPTS()}/${scriptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load script draft');
      }

      const data = await response.json();
      setScriptDraft(data.data || data); // Handle wrapped response
    } catch (err) {
      console.error('Error loading script draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to load script');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a message in the chat conversation
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isStreaming) return;

      try {
        setIsStreaming(true);
        setError(null);

        // Create user message immediately
        const userMessage: ChatMessage = {
          id: `msg_${Date.now()}_user`,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Prepare streaming assistant message
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          metadata: { isStreaming: true },
        };

        setMessages((prev) => [...prev, assistantMessage]);
        streamingMessageRef.current = assistantMessage;

        // Prepare request
        const chatRequest: ScriptChatRequest = {
          scriptId: scriptDraft?.id,
          message,
          outputLanguage: options.outputLanguage || 'fr',
          editorialProfileId: options.editorialProfileId,
          isPro: isPro,
        };

        const token = await getToken();

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        const requestUrl = `${API_ENDPOINTS.SCRIPTS()}/chat?stream=false`;

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(chatRequest),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error);
          throw new Error(result.error);
        }

        // Handle non-streaming response for now
        const result = await response.json();

        // Update messages with the response
        if (result.data?.message) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...result.data.message, metadata: { isStreaming: false } }
                : msg
            )
          );
        } else {
          console.warn('⚠️ No message found in response data');
        }

        // Update current script if available
        if (result.data?.currentScript) {
          setCurrentScript(result.data.currentScript);
        } else {
          console.warn('⚠️ No currentScript found in response data');
        }

        // Reload the complete script draft if available
        if (result.data?.scriptId) {
          await loadScriptDraft(result.data.scriptId);
        } else {
          console.warn('⚠️ No scriptId found in response data');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);

          // Remove the failed streaming message
          setMessages((prev) =>
            prev.filter(
              (msg) => !(msg.metadata?.isStreaming && msg.role === 'assistant')
            )
          );
        }
      } finally {
        setIsStreaming(false);
        setStreamingStatus(null);
        setIsLoading(false);
        streamingMessageRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [
      scriptDraft?.id,
      options.outputLanguage,
      options.editorialProfileId,
      isStreaming,
    ]
  );

  /**
   * Handle streaming response from server
   */
  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream available');

    const decoder = new TextDecoder();
    let fullContent = '';
    let currentScriptUpdate = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'status_update':
                  // Update loading status with detailed feedback
                  setStreamingStatus(data.message);
                  break;

                case 'message_start':
                  // Script draft ID available
                  if (data.scriptId && !scriptDraft) {
                    loadScriptDraft(data.scriptId);
                  }
                  break;

                case 'content_delta':
                  // Update streaming message content
                  fullContent += data.content;
                  if (streamingMessageRef.current) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === streamingMessageRef.current?.id
                          ? { ...msg, content: fullContent }
                          : msg
                      )
                    );
                  }
                  break;

                case 'message_complete':
                  // Finalize message and update script
                  if (data.message && data.currentScript) {
                    currentScriptUpdate = data.currentScript;

                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === streamingMessageRef.current?.id
                          ? {
                              ...data.message,
                              metadata: {
                                ...data.message.metadata,
                                isStreaming: false,
                              },
                            }
                          : msg
                      )
                    );

                    setCurrentScript(data.currentScript);

                    // Update script draft if available
                    if (data.scriptId) {
                      loadScriptDraft(data.scriptId);
                    }
                  }
                  break;

                case 'error':
                  throw new Error(data.error || 'Streaming error');
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * Create a new script conversation
   */
  const createNewScript = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Reset state
      setScriptDraft(null);
      setMessages([]);
      setCurrentScript('');

      // The script will be created when the first message is sent
    } catch (err) {
      console.error('Error creating new script:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create new script'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save current state as draft
   */
  const saveAsDraft = useCallback(async () => {
    if (!scriptDraft) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      await fetch(`${API_ENDPOINTS.SCRIPTS()}/${scriptDraft.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'draft',
        }),
      });

      // Reload the script draft to get updated data
      await loadScriptDraft(scriptDraft.id);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  }, [scriptDraft]);

  /**
   * Validate and finalize script
   */
  const validateScript = useCallback(async () => {
    if (!scriptDraft) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.SCRIPTS()}/${scriptDraft.id}/validate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to validate script');
      }

      // Reload the script draft to get updated status
      await loadScriptDraft(scriptDraft.id);
    } catch (err) {
      console.error('Error validating script:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to validate script'
      );
    } finally {
      setIsLoading(false);
    }
  }, [scriptDraft]);

  /**
   * Duplicate current script
   */
  const duplicateScript = useCallback(async (): Promise<ScriptDraft | null> => {
    if (!scriptDraft) return null;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.SCRIPTS()}/${scriptDraft.id}/duplicate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to duplicate script');
      }

      const result = await response.json();

      return result.data.script;
    } catch (err) {
      console.error('Error duplicating script:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to duplicate script'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [scriptDraft]);

  /**
   * Delete current script
   */
  const deleteScript = useCallback(async (): Promise<boolean> => {
    if (!scriptDraft) return false;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.SCRIPTS()}/${scriptDraft.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete script');
      }

      // Reset local state
      setScriptDraft(null);
      setMessages([]);
      setCurrentScript('');

      return true;
    } catch (err) {
      console.error('Error deleting script:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete script');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [scriptDraft]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const wordCount = currentScript ? currentScript.split(/\s+/).length : 0;
  const estimatedDuration = estimateScriptDuration(currentScript);
  const title =
    scriptDraft?.title ||
    generateScriptTitle(currentScript) ||
    'Nouveau Script';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    scriptDraft,
    messages,
    currentScript,
    isLoading,
    isStreaming,
    error,
    streamingStatus,

    // Actions
    sendMessage,
    createNewScript,
    saveAsDraft,
    validateScript,
    duplicateScript,
    deleteScript,
    clearError,

    // Metadata
    wordCount,
    estimatedDuration,
    title,
  };
}

/**
 * Hook for managing script list
 */
export function useScriptList() {
  const { getToken } = useAuth();
  const [scripts, setScripts] = useState<ScriptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadScripts = useCallback(async (page = 1, status?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();

      const apiUrl = API_ENDPOINTS.SCRIPTS();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (status) {
        params.set('status', status);
      }

      const fullUrl = `${apiUrl}?${params}`;

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to load scripts: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // The API returns data in data.data.scripts format due to successResponseExpress wrapper
      const scriptsData = data.data || data;

      if (page === 1) {
        setScripts(scriptsData.scripts || []);
      } else {
        setScripts((prev) => [...prev, ...(scriptsData.scripts || [])]);
      }

      setHasMore(scriptsData.hasMore || false);
    } catch (err) {
      console.error('Error loading scripts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scripts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteScript = useCallback(async (scriptId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.SCRIPTS()}/${scriptId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete script');
      }

      setScripts((prev) => prev.filter((script) => script.id !== scriptId));
    } catch (err) {
      console.error('Error deleting script:', err);
      throw err;
    }
  }, []);

  const duplicateScript = useCallback(
    async (scriptId: string) => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${API_ENDPOINTS.SCRIPTS()}/${scriptId}/duplicate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to duplicate script');
        }

        const data = await response.json();

        // Reload scripts to include the new duplicate
        await loadScripts();

        return data.script;
      } catch (err) {
        console.error('Error duplicating script:', err);
        throw err;
      }
    },
    [loadScripts]
  );

  // Load scripts on mount
  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  return {
    scripts,
    isLoading,
    error,
    hasMore,
    loadScripts,
    deleteScript,
    duplicateScript,
  };
}
