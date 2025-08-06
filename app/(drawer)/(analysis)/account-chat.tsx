import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Send,
  TrendingUp,
  AlertCircle,
  Lock,
  MessageCircle,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { useTikTokChatSimple } from '@/components/hooks/useTikTokChatSimple';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { FeatureLock } from '@/components/guards/FeatureLock';
import VoiceDictation from '@/components/VoiceDictation';
import { accountChatStyles, markdownStyles } from '@/lib/utils/styles/accountChat.styles';
import { useLocalSearchParams } from 'expo-router';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export default function AccountChatScreen() {
  const { currentPlan, presentPaywall } = useRevenueCat();
  const { analysis, isLoading, error, setCurrentConversation } = useAnalysisContext();
  
  // Get conversation ID and title from route params FIRST
  const params = useLocalSearchParams<{
    conversationId?: string;
    chatTitle?: string;
    new?: string; // NEW: parameter to force new chat
  }>();
  
  const isNewChat = params.new === 'true';
  const conversationId = isNewChat ? undefined : params.conversationId; // Force undefined for new chat
  const chatTitle = params.chatTitle;
  
  console.log('🔍 account-chat params:', params);
  console.log('🔍 conversationId:', conversationId);
  console.log('🔍 chatTitle:', chatTitle);
  
  // Now use the params in the hook
  const {
    messages,
    sendMessage,
    isLoading: isStreaming,
    error: chatError,
    clearError,
    isLoadingMessages, // Add this missing property
  } = useTikTokChatSimple({
    conversationId,
    conversationTitle: chatTitle,
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [showLockScreen, setShowLockScreen] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get existing analysis for context
  const existingAnalysis = analysis;

  // Clean up URL and context when starting new chat
  useEffect(() => {
    if (isNewChat) {
      console.log('🆕 account-chat: Starting new chat, cleaning URL and context');
      // Clear any existing conversation from context
      setCurrentConversation(null);
      // Clean up URL by removing the new parameter
      router.replace('/(drawer)/(analysis)/account-chat');
    }
  }, [isNewChat, setCurrentConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
            <Text selectable style={[accountChatStyles.messageText, accountChatStyles.userText]}>
              {message.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}
        </View>
        <Text selectable style={accountChatStyles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(messageToSend);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Paywall for non-Pro users using FeatureLock

  // if (currentPlan === 'free' && showLockScreen) {
  //   console.log('🔍 Showing lock screen for free user');
  //   return (
  //     <SafeAreaView style={accountChatStyles.container} edges={['top']}>
  //       <FeatureLock requiredPlan="creator" onLockPress={presentPaywall}>
  //         <View style={accountChatStyles.lockContainer}>
  //           <Lock size={48} color={SHARED_STYLE_COLORS.primary} />
  //           <Text style={accountChatStyles.lockTitle}>Chat TikTok Pro</Text>
  //           <Text style={accountChatStyles.lockDescription}>
  //             Analysez votre compte TikTok et discutez avec notre IA experte
  //             pour obtenir des conseils personnalisés et optimiser votre
  //             stratégie de contenu.
  //           </Text>

  //           <View style={accountChatStyles.featuresPreview}>
  //             <View style={accountChatStyles.featureItem}>
  //               <MessageCircle size={20} color={SHARED_STYLE_COLORS.success} />
  //               <Text style={accountChatStyles.featureText}>
  //                 Chat intelligent avec votre expert IA
  //               </Text>
  //             </View>
  //             <View style={accountChatStyles.featureItem}>
  //               <Sparkles size={20} color={SHARED_STYLE_COLORS.secondary} />
  //               <Text style={accountChatStyles.featureText}>
  //                 Recommandations personnalisées en temps réel
  //               </Text>
  //             </View>
  //             <View style={accountChatStyles.featureItem}>
  //               <Zap size={20} color={SHARED_STYLE_COLORS.warning} />
  //               <Text style={accountChatStyles.featureText}>
  //                 Stratégies d&apos;engagement optimisées
  //               </Text>
  //             </View>
  //             <View style={accountChatStyles.featureItem}>
  //               <Users size={20} color={SHARED_STYLE_COLORS.accent} />
  //               <Text style={accountChatStyles.featureText}>
  //                 Analyse des tendances de votre niche
  //               </Text>
  //             </View>
  //           </View>

  //           <TouchableOpacity
  //             style={accountChatStyles.upgradeButton}
  //             onPress={presentPaywall}
  //           >
  //             <Text style={accountChatStyles.upgradeButtonText}>
  //               Débloquer avec le Plan Créateur
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       </FeatureLock>
  //     </SafeAreaView>
  //   );
  // }

  // Main chat interface (simplified like chat.tsx)
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView
        style={accountChatStyles.container}
        edges={['top']}
      >
        {/* Header with reset button for testing */}
        <AnalysisHeader
          title={isNewChat ? 'Nouveau Chat' : (chatTitle || 'Chat TikTok')}
          showBackButton={true}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(drawer)/(analysis)/account-conversations');
            }
          }}
        />

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={accountChatStyles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading indicator for initial conversation load */}
          {isLoadingMessages && messages.length === 0 && (
            <View style={accountChatStyles.loadingMessagesContainer}>
              <ActivityIndicator size="large" color={SHARED_STYLE_COLORS.primary} />
              <Text style={accountChatStyles.loadingText}>
                Chargement de la conversation...
              </Text>
            </View>
          )}

          {/* Welcome message */}
          {messages.length === 0 && !isLoadingMessages && !isLoading && (
            <View style={accountChatStyles.welcomeMessage}>
              <TrendingUp size={24} color={SHARED_STYLE_COLORS.primary} />
              <Text style={accountChatStyles.welcomeText}>
                {existingAnalysis
                  ? `👋 Salut ! Je connais votre compte @${existingAnalysis.tiktok_handle} et peux vous donner des conseils personnalisés basés sur votre analyse TikTok.`
                  : `👋 Salut ! Je suis votre expert TikTok IA. Posez-moi des questions sur la stratégie de contenu, l&apos;engagement, ou donnez-moi votre handle TikTok pour une analyse personnalisée.`}
              </Text>
            </View>
          )}

          {/* Error display */}
          {error && (
            <View style={accountChatStyles.errorContainer}>
              <AlertCircle size={16} color={SHARED_STYLE_COLORS.error} />
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
              <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.primary} />
              <Text style={accountChatStyles.typingText}>
                {isStreaming ? 'EditIA écrit...' : 'EditIA réfléchit...'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Section (simplified like chat.tsx) */}
        <View style={accountChatStyles.inputContainer}>
          {/* Suggestions for first message - only show for new chats or empty existing chats */}
          {messages.length === 0 && !isLoadingMessages && (
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
