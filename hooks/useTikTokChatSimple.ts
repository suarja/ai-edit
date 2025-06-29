import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface UseTikTokChatSimpleReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

/**
 * Simplified TikTok chat hook without streaming
 * Based on the working useScriptChat pattern
 */
export function useTikTokChatSimple(): UseTikTokChatSimpleReturn {
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message with simple JSON response
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading || !isPro) return;

    const currentMessage = message.trim();
    setError(null);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const token = await getToken();
      
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_CHAT(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          streaming: false, // Use simple JSON response
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add assistant response (data.data.message.content from ChatService)
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.data?.message?.content || data.response || data.message || 'Sorry, I could not process your request.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('Error sending TikTok chat message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isPro, getToken]);

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
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
} 