import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';
import useAccountAnalysis from './useAccountAnalysis';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseTikTokChatProps {
  enableStreaming?: boolean;
  conversationId?: string;
  conversationTitle?: string;
}

interface UseTikTokChatSimpleReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  resetConversation: () => void;
  chatTitle: string | null;
}

export function useTikTokChatSimple(props: UseTikTokChatProps = {}): UseTikTokChatSimpleReturn {
  const { conversationId, conversationTitle } = props;
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  const { analysis: existingAnalysis } = useAccountAnalysis();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(conversationTitle || null);
  
  const previousConversationIdRef = useRef<string | undefined>(conversationId);

  useEffect(() => {
    previousConversationIdRef.current = conversationId;
  }, []);

  useEffect(() => {
    if (isPro) {
      const hasConversationChanged = previousConversationIdRef.current !== conversationId;

      if (hasConversationChanged) {
        resetConversation();
        previousConversationIdRef.current = conversationId;
        
        if (conversationId) {
          loadConversationMessages(conversationId);
        }
      }
    }
  }, [isPro, conversationId]);

  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_CONVERSATION_MESSAGES(convId), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        const loadedMessages: ChatMessage[] = data.data.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at || msg.timestamp),
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load conversation messages:', error);
    }
  }, [getToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const sendMessage = async (message: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
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
      
      let assistantContent = result.data?.message?.content || result.data?.content || '';
      if (result.data.changeTitle) {
        setChatTitle(result.data.newTitle);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearError,
    resetConversation,
    chatTitle,
  };
}