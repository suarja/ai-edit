import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    isStreaming?: boolean;
    isSystemMessage?: boolean;
    isError?: boolean;
  };
}

interface UseTikTokChatOptions {
  runId?: string;
  tiktokHandle?: string;
}

interface UseTikTokChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

/**
 * Hook for TikTok chat with streaming support
 */
export function useTikTokChat(options: UseTikTokChatOptions = {}): UseTikTokChatReturn {
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for streaming
  const streamingMessageRef = useRef<ChatMessage | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message with streaming support
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming || !isPro) return;

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

      setMessages(prev => [...prev, userMessage]);

      // Prepare streaming assistant message
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        metadata: { isStreaming: true },
      };

      setMessages(prev => [...prev, assistantMessage]);
      streamingMessageRef.current = assistantMessage;

      const token = await getToken();
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Prepare request body
      const requestBody = {
        message,
        run_id: options.runId,
        tiktok_handle: options.tiktokHandle,
        streaming: true,
        is_pro: isPro, // Send Pro status to backend
      };

      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_CHAT(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      // Handle streaming response
      await handleStreamingResponse(response);

    } catch (err) {
      console.error('Error sending TikTok chat message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove streaming message on error
      if (streamingMessageRef.current) {
        setMessages(prev => prev.filter(msg => msg.id !== streamingMessageRef.current?.id));
      }
    } finally {
      setIsStreaming(false);
      streamingMessageRef.current = null;
    }
  }, [isStreaming, isPro, options.runId, options.tiktokHandle, getToken]);

  /**
   * Handle streaming response from server
   */
  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available for streaming response');
    }

    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content_delta' && data.content) {
                fullResponse += data.content;
                
                // Update streaming message
                if (streamingMessageRef.current) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageRef.current?.id
                      ? { ...msg, content: fullResponse }
                      : msg
                  ));
                }
              } else if (data.type === 'message_complete') {
                // Finalize message
                if (streamingMessageRef.current) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageRef.current?.id
                      ? { 
                          ...msg, 
                          content: data.response || fullResponse,
                          metadata: { isStreaming: false }
                        }
                      : msg
                  ));
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Streaming error');
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
} 