import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAccountAnalysis } from './useAccountAnalysis';

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
  existingAnalysis: any | null;
  hasAnalysis: boolean;
  isLoadingMessages: boolean;
}

/**
 * Simplified TikTok chat hook without streaming
 * Based on the working useScriptChat pattern
 * Now includes analysis context for proper LLM responses
 */
export function useTikTokChatSimple(props: UseTikTokChatProps = {}): UseTikTokChatSimpleReturn {
  const { enableStreaming = false, conversationId, conversationTitle } = props;
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  // Use the centralized hook for analysis context
  const { analysis: existingAnalysis, isLoading: isAnalysisLoading } = useAccountAnalysis();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(conversationTitle || null);
  
  // Track the ID of the conversation that is actually loaded
  const [loadedConversationId, setLoadedConversationId] = useState<string | undefined>(undefined);

  // Handle conversation changes (existing or new)
  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      isPro,
      conversationId,
      loadedConversationId,
    });
    
    if (isPro) {
      // Check if the conversationId from props is different from the one we have loaded
      if (conversationId !== loadedConversationId) {
        console.log('🔄 Conversation changed:', {
          from: loadedConversationId,
          to: conversationId,
        });
        
        // Reset state for the new conversation
        resetConversation();
        
        if (conversationId) {
          console.log('📂 Loading new conversation:', conversationId);
          loadConversationMessages(conversationId);
        } else {
          // This is a new chat, no messages to load.
          // Set the loaded ID to undefined to signify a new chat.
          setLoadedConversationId(undefined);
          console.log('🆕 Starting new conversation');
        }
      } else {
        console.log('📋 No conversation change detected');
      }
    }
  }, [isPro, conversationId, loadedConversationId]);

  /**
   * Load conversation messages for existing conversation
   */
  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      console.log('📥 Loading conversation messages:', convId);
      const token = await getToken();
      setIsLoadingMessages(true);
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
          setMessages([]); // Ensure messages are cleared if a conversation is empty
      }
    } catch (error) {
      console.warn('⚠️ Failed to load conversation messages:', error);
      setMessages([]);
    } finally {
        // Mark this conversation as loaded
        setLoadedConversationId(convId);
        setIsLoadingMessages(false);
    }
  }, [getToken]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset conversation state
   */
  const resetConversation = useCallback(() => {
    console.log('🔄 Resetting conversation state');
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    // Do NOT reset loadedConversationId here, it's the trigger for the effect
  }, []);

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

      console.log("sendMessageRegular", payload, "conversationId", conversationId);
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
        console.log("result", result);
        throw new Error(result.error || 'Failed to send message');
      }

      console.log("result changeTitle", result.data.changeTitle);

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
      console.error('❌ Chat error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 MAIN SEND MESSAGE FUNCTION
  const sendMessage = async (message: string): Promise<void> => {
    // Determine which function to call based on enableStreaming prop
    if (enableStreaming) {
      // await sendMessageStreaming(message);
      console.warn("Streaming is not fully implemented yet.");
      await sendMessageRegular(message);
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
    resetConversation,
    chatTitle,
    existingAnalysis: existingAnalysis || null,
    hasAnalysis: !!existingAnalysis,
    isLoadingMessages,
  };
} 