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
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useAccountAnalysis } from '@/components/hooks/useAccountAnalysis';
import { useTikTokChatSimple } from '@/components/hooks/useTikTokChatSimple';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { FeatureLock } from '@/components/guards/FeatureLock';
import VoiceDictation from '@/components/VoiceDictation';
import { accountChatStyles } from '@/lib/utils/styles/accountChat.styles';
import { useLocalSearchParams } from 'expo-router';

export default function AccountChatScreen() {
  const { currentPlan, presentPaywall } = useRevenueCat();
  const { analysis, isLoading, error, refreshAnalysis } = useAccountAnalysis();
  const {
    messages,
    sendMessage,
    isLoading: isStreaming,
    error: chatError,
    clearError,
  } = useTikTokChatSimple();
  const [inputMessage, setInputMessage] = useState('');
  const [showLockScreen, setShowLockScreen] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get conversation ID and title from route params
  const { conversationId, chatTitle } = useLocalSearchParams<{
    conversationId?: string;
    chatTitle?: string;
  }>();

  // Get existing analysis for context
  const existingAnalysis = analysis;

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
        <Text style={accountChatStyles.messageText}>{message.content}</Text>
        <Text style={accountChatStyles.messageTime}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
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
  console.log('🔍 AccountChat Debug - currentPlan:', currentPlan);

  if (currentPlan === 'free' && showLockScreen) {
    console.log('🔍 Showing lock screen for free user');
    return (
      <SafeAreaView style={accountChatStyles.container} edges={['top']}>
        <FeatureLock requiredPlan="creator" onLockPress={presentPaywall}>
          <View style={accountChatStyles.lockContainer}>
            <Lock size={48} color="#007AFF" />
            <Text style={accountChatStyles.lockTitle}>Chat TikTok Pro</Text>
            <Text style={accountChatStyles.lockDescription}>
              Analysez votre compte TikTok et discutez avec notre IA experte
              pour obtenir des conseils personnalisés et optimiser votre
              stratégie de contenu.
            </Text>

            <View style={accountChatStyles.featuresPreview}>
              <View style={accountChatStyles.featureItem}>
                <MessageCircle size={20} color="#10b981" />
                <Text style={accountChatStyles.featureText}>
                  Chat intelligent avec votre expert IA
                </Text>
              </View>
              <View style={accountChatStyles.featureItem}>
                <Sparkles size={20} color="#3b82f6" />
                <Text style={accountChatStyles.featureText}>
                  Recommandations personnalisées en temps réel
                </Text>
              </View>
              <View style={accountChatStyles.featureItem}>
                <Zap size={20} color="#f59e0b" />
                <Text style={accountChatStyles.featureText}>
                  Stratégies d&apos;engagement optimisées
                </Text>
              </View>
              <View style={accountChatStyles.featureItem}>
                <Users size={20} color="#8b5cf6" />
                <Text style={accountChatStyles.featureText}>
                  Analyse des tendances de votre niche
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={accountChatStyles.upgradeButton}
              onPress={presentPaywall}
            >
              <Text style={accountChatStyles.upgradeButtonText}>
                Débloquer avec le Plan Créateur
              </Text>
            </TouchableOpacity>
          </View>
        </FeatureLock>
      </SafeAreaView>
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
          {messages.length === 0 && !isLoading && (
            <View style={accountChatStyles.welcomeMessage}>
              <TrendingUp size={24} color="#007AFF" />
              <Text style={accountChatStyles.welcomeText}>
                {existingAnalysis
                  ? `👋 Salut ! Je connais votre compte @${existingAnalysis.tiktok_handle} et peux vous donner des conseils personnalisés basés sur votre analyse TikTok.`
                  : `👋 Salut ! Je suis votre expert TikTok IA. Posez-moi des questions sur la stratégie de contenu, l&apos;engagement, ou donnez-moi votre handle TikTok pour une analyse personnalisée.`}
              </Text>
            </View>
          )}

          {isLoading && (
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
