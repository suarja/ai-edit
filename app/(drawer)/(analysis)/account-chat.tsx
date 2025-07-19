import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useTikTokChatSimple } from '@/components/hooks/useTikTokChatSimple';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import Markdown from 'react-native-markdown-display';
import ProPaywall from '@/components/analysis/ProPaywall';
import VoiceDictation from '@/components/VoiceDictation';
import {
  accountChatStyles,
  markdownStyles,
} from '@/lib/utils/styles/accountChat.styles';

/**
 * 🎯 SIMPLIFIED TIKTOK ANALYSIS CHAT
 *
 * Simple flow like the working chat.tsx:
 * 1. Paywall check (if not Pro)
 * 2. Simple chat interface
 * 3. Regular JSON API calls (no streaming)
 */
export default function AccountChatScreen() {
  const { currentPlan, presentPaywall } = useRevenueCat();
  const { conversationId, conversationTitle } = useLocalSearchParams<{
    conversationId?: string;
    conversationTitle?: string;
  }>();
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(
    conversationTitle || null
  );
  // Use TikTok chat hook with streaming enabled
  const {
    messages,
    isLoading,
    isStreaming,
    isLoadingMessages,
    error,
    sendMessage,
    clearError,
    existingAnalysis,
    chatTitle: chatTitleHook,
  } = useTikTokChatSimple({
    enableStreaming: false,
    conversationId: conversationId || undefined,
    conversationTitle: conversationTitle || undefined,
  });

  useEffect(() => {
    setChatTitle(chatTitleHook);
  }, [chatTitleHook]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Reset input when conversation changes
  useEffect(() => {
    setInputMessage('');
    console.log('conversationId', conversationId);
    console.log('conversationTitle', conversationTitle);
  }, [conversationId]);

  // Helper function to render chat messages (same as working chat.tsx)
  function renderMessage(message: any) {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          accountChatStyles.messageContainer,
          isUser
            ? accountChatStyles.userMessage
            : accountChatStyles.assistantMessage,
        ]}
      >
        <View
          style={[
            accountChatStyles.messageBubble,
            isUser
              ? accountChatStyles.userBubble
              : accountChatStyles.assistantBubble,
          ]}
        >
          {isUser ? (
            <Text style={accountChatStyles.messageText}>{message.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}

          <View style={accountChatStyles.messageFooter}>
            <Text style={accountChatStyles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isUser && (
              <CheckCircle2
                size={12}
                color="#4CD964"
                style={accountChatStyles.checkmark}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  // Handle sending chat messages with streaming support
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isStreaming) return;
    const currentMessage = inputMessage.trim();
    setInputMessage(''); // Vide l'input tout de suite

    try {
      await sendMessage(currentMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Paywall for non-Pro users (simplified)
  if (currentPlan === 'free') {
    return (
      <ProPaywall
        title="Chat TikTok Pro"
        description="Analysez votre compte TikTok et discutez avec notre IA experte pour obtenir des conseils personnalisés et optimiser votre stratégie de contenu."
        features={[
          'Analyse complète de votre compte TikTok',
          'Chat intelligent avec votre expert IA',
          'Recommandations personnalisées en temps réel',
          "Stratégies d'engagement optimisées",
          'Analyse des tendances de votre niche',
        ]}
        onUpgrade={presentPaywall}
      />
    );
  }

  // Main chat interface (simplified like chat.tsx)
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView
        key={conversationId || 'new'}
        style={accountChatStyles.container}
        edges={['top']}
      >
        {/* Header with reset button for testing */}
        <AnalysisHeader
          title={chatTitle || 'Nouveau Chat'}
          showBackButton={true}
          onBack={() =>
            router.push('/(drawer)/(analysis)/account-conversations')
          }
        />

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={accountChatStyles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome message */}
          {messages.length === 0 && !isLoadingMessages && (
            <View style={accountChatStyles.welcomeMessage}>
              <TrendingUp size={24} color="#007AFF" />
              <Text style={accountChatStyles.welcomeText}>
                {existingAnalysis
                  ? `👋 Salut ! Je connais votre compte @${existingAnalysis.tiktok_handle} et peux vous donner des conseils personnalisés basés sur votre analyse TikTok.`
                  : `👋 Salut ! Je suis votre expert TikTok IA. Posez-moi des questions sur la stratégie de contenu, l'engagement, ou donnez-moi votre handle TikTok pour une analyse personnalisée.`}
              </Text>
            </View>
          )}

          {isLoadingMessages && (
            <View style={accountChatStyles.loadingMessagesContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}

          {/* Error display */}
          {error && (
            <View style={accountChatStyles.errorContainer}>
              <AlertCircle size={16} color="#ff5555" />
              <Text style={accountChatStyles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={clearError}
                style={accountChatStyles.errorDismiss}
              >
                <Text style={accountChatStyles.errorDismissText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Messages */}
          {messages.map(renderMessage)}

          {/* Loading/Streaming indicator */}
          {(isLoading || isStreaming) && (
            <View style={accountChatStyles.typingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={accountChatStyles.typingText}>
                {isStreaming ? 'EditIA écrit...' : 'EditIA réfléchit...'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Section (simplified like chat.tsx) */}
        <View style={accountChatStyles.inputContainer}>
          {/* Suggestions for first message */}
          {messages.length === 0 && (
            <View style={accountChatStyles.suggestionsContainer}>
              {existingAnalysis ? (
                <>
                  <TouchableOpacity
                    style={accountChatStyles.suggestionCard}
                    onPress={() =>
                      setInputMessage(
                        `Quels sont mes points forts sur @${existingAnalysis.tiktok_handle} ?`
                      )
                    }
                  >
                    <Text style={accountChatStyles.suggestionTitle}>
                      Mes points forts
                    </Text>
                    <Text style={accountChatStyles.suggestionSubtitle}>
                      Analyse de mes forces
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={accountChatStyles.suggestionCard}
                    onPress={() =>
                      setInputMessage('Comment améliorer mon engagement ?')
                    }
                  >
                    <Text style={accountChatStyles.suggestionTitle}>
                      Améliorer l&apos;engagement
                    </Text>
                    <Text style={accountChatStyles.suggestionSubtitle}>
                      Conseils personnalisés
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={accountChatStyles.suggestionCard}
                    onPress={() =>
                      setInputMessage('Analyse mon compte @username')
                    }
                  >
                    <Text style={accountChatStyles.suggestionTitle}>
                      Analyser un compte
                    </Text>
                    <Text style={accountChatStyles.suggestionSubtitle}>
                      @username pour analyse complète
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={accountChatStyles.suggestionCard}
                    onPress={() =>
                      setInputMessage('Comment améliorer mon engagement ?')
                    }
                  >
                    <Text style={accountChatStyles.suggestionTitle}>
                      Conseils d&apos;engagement
                    </Text>
                    <Text style={accountChatStyles.suggestionSubtitle}>
                      Stratégies personnalisées
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={accountChatStyles.inputWrapper}>
              <TextInput
                style={accountChatStyles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Posez une question ou donnez votre handle TikTok..."
                placeholderTextColor="#888"
                multiline
                maxLength={500}
                editable={!isLoading && !isStreaming}
              />
              <VoiceDictation
                currentValue={inputMessage}
                onTranscriptChange={setInputMessage}
              />
            </View>

            <TouchableOpacity
              style={[
                accountChatStyles.sendButton,
                (!inputMessage.trim() || isLoading || isStreaming) &&
                  accountChatStyles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isStreaming}
            >
              {isLoading || isStreaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
