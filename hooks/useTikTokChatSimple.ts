import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExistingAnalysis {
  id: string;
  tiktok_handle: string;
  status: string;
  result?: any;
}

interface TikTokAnalysis {
  id: string;
  tiktok_handle: string;
  status: string;
  result?: any;
}

interface UseTikTokChatProps {
  enableStreaming?: boolean;
  conversationId?: string;
}

interface UseTikTokChatSimpleReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  existingAnalysis: TikTokAnalysis | null;
  hasAnalysis: boolean;
  refreshAnalysis: () => Promise<void>;
}

/**
 * Simplified TikTok chat hook without streaming
 * Based on the working useScriptChat pattern
 * Now includes analysis context for proper LLM responses
 */
export function useTikTokChatSimple(props: UseTikTokChatProps = {}): UseTikTokChatSimpleReturn {
  const { enableStreaming = true, conversationId } = props;
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAnalysis, setExistingAnalysis] = useState<TikTokAnalysis | null>(null);

  // Handle conversation changes (existing or new)
  useEffect(() => {
    if (isPro) {
      fetchExistingAnalysis();
      if (conversationId) {
        console.log('📂 Loading existing conversation:', conversationId);
        loadConversationMessages(conversationId);
      } else {
        console.log('🆕 Starting new conversation');
        setMessages([]);
        setError(null);
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  }, [isPro, conversationId]);

  /**
   * Fetch user's existing analysis to provide context to chat
   */
  const fetchExistingAnalysis = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setExistingAnalysis(data.data);
        console.log('📊 Found existing analysis for chat context:', data.data.tiktok_handle);
      } else {
        setExistingAnalysis(null);
        console.log('📭 No existing analysis found for chat context');
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch existing analysis for chat:', error);
      setExistingAnalysis(null);
    }
  }, [getToken]);

  /**
   * Load conversation messages for existing conversation
   */
  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      console.log('📥 Loading conversation messages:', convId);
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_CONVERSATION_MESSAGES(convId), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        // Transform server messages to ChatMessage format
        const loadedMessages: ChatMessage[] = data.data.map((msg: any) => ({
          id: msg.id || msg.message_id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at || msg.timestamp),
        }));
        
        setMessages(loadedMessages);
        console.log(`✅ Loaded ${loadedMessages.length} messages for conversation ${convId}`);
      } else {
        console.log('📭 No messages found for conversation:', convId);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load conversation messages:', error);
      // Don't set error state for this - just continue with empty conversation
    }
  }, [getToken]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 🆕 STREAMING VERSION
  const sendMessageStreaming = async (message: string): Promise<void> => {
    try {
      setIsLoading(true);
      setIsStreaming(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      const token = await getToken();
      const payload = {
        message,
        streaming: true,
        conversation_id: conversationId,
        run_id: existingAnalysis?.id,
        tiktok_handle: existingAnalysis?.tiktok_handle,
      };

      console.log('🔄 Starting streaming chat request:', {
        hasAnalysis: !!existingAnalysis,
        handle: existingAnalysis?.tiktok_handle,
      });

      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_CHAT(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle streaming response - improved error handling
      if (!response.body) {
        throw new Error('Response body is not available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('✅ Streaming completed');
            break;
          }

          if (!value) continue;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') {
                  console.log('✅ Streaming done signal received');
                  break;
                }

                const data = JSON.parse(jsonStr);
                
                if (data.type === 'content_delta' && data.content) {
                  // Update assistant message content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  ));
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Streaming error');
                } else if (data.type === 'status_update') {
                  console.log('📡 Status:', data.message);
                } else if (data.type === 'message_complete') {
                  console.log('✅ Message complete received');
                  // Update final message if needed
                  if (data.message && data.message.content) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessage.id
                        ? { ...msg, content: data.message.content }
                        : msg
                    ));
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Could not parse SSE data:', line, parseError);
                // Continue processing other lines
              }
            }
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch (releaseError) {
          console.warn('⚠️ Could not release reader lock:', releaseError);
        }
      }

    } catch (error) {
      console.error('❌ Streaming error:', error);
      setError(error instanceof Error ? error.message : 'Unknown streaming error');
      
      // Remove any incomplete assistant message
      setMessages(prev => prev.filter(msg => msg.role !== 'assistant' || msg.content.trim() !== ''));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 🔄 NON-STREAMING VERSION (fallback)
  const sendMessageRegular = async (message: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      const token = await getToken();
      const payload = {
        message,
        streaming: false,
        conversation_id: conversationId,
        run_id: existingAnalysis?.id,
        tiktok_handle: existingAnalysis?.tiktok_handle,
      };

      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_CHAT(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Handle different response formats
      let assistantContent = '';
      if (result.data?.data?.message?.content) {
        assistantContent = result.data.data.message.content;
      } else if (result.data?.message?.content) {
        assistantContent = result.data.message.content;
      } else if (result.data?.content) {
        assistantContent = result.data.content;
      } else if (typeof result.data === 'string') {
        assistantContent = result.data;
      } else {
        throw new Error('Invalid response format');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('❌ Chat error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 MAIN SEND MESSAGE FUNCTION
  const sendMessage = async (message: string): Promise<void> => {
    if (enableStreaming) {
      await sendMessageStreaming(message);
    } else {
      await sendMessageRegular(message);
    }
  };



  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearError,
    existingAnalysis,
    hasAnalysis: !!existingAnalysis,
    refreshAnalysis: fetchExistingAnalysis,
  };
} 