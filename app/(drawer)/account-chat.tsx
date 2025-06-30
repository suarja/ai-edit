import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send, 
  MessageCircle, 
  CheckCircle2, 
  BarChart3, 
  TrendingUp, 
  Crown,
  AlertCircle,
  RefreshCw
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useRevenueCat } from '@/providers/RevenueCat';
import { useTikTokChatSimple } from '@/hooks/useTikTokChatSimple';

/**
 * 🎯 SIMPLIFIED TIKTOK ANALYSIS CHAT
 * 
 * Simple flow like the working chat.tsx:
 * 1. Paywall check (if not Pro)
 * 2. Simple chat interface
 * 3. Regular JSON API calls (no streaming)
 */
export default function AccountChatScreen() {
  const { isSignedIn } = useAuth();
  const { isPro, goPro } = useRevenueCat();
  const { conversationId, conversationTitle } = useLocalSearchParams<{ conversationId?: string, conversationTitle?: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Use TikTok chat hook with streaming enabled
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearError,
    existingAnalysis,
    hasAnalysis,
    resetConversation,
  } = useTikTokChatSimple({ 
    enableStreaming: false,
    conversationId: conversationId || undefined,
    conversationTitle: conversationTitle || undefined,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Reset input when conversation changes
  useEffect(() => {
    setInputMessage('');
  }, [conversationId]);

  // Helper function to render chat messages (same as working chat.tsx)
  function renderMessage(message: any) {
    const isUser = message.role === 'user';
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText
          ]}>
            {message.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            {isUser && (
              <CheckCircle2 size={12} color="#4CD964" style={styles.checkmark} />
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
    setInputMessage('');
    
    try {
      await sendMessage(currentMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle authentication
  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={styles.centeredText}>Connectez-vous pour analyser vos comptes TikTok</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Paywall for non-Pro users (simplified)
  if (!isPro) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.paywallContainer}>
          <View style={styles.paywallHeader}>
            <Crown size={48} color="#FFD700" />
            <Text style={styles.paywallTitle}>Chat TikTok Pro</Text>
          </View>
          
          <Text style={styles.paywallDescription}>
            Analysez votre compte TikTok et discutez avec notre IA experte pour 
            obtenir des conseils personnalisés et optimiser votre stratégie de contenu.
          </Text>
          
          <View style={styles.featuresList}>
            <FeatureItem text="Analyse complète de votre compte TikTok" />
            <FeatureItem text="Chat intelligent avec votre expert IA" />
            <FeatureItem text="Recommandations personnalisées en temps réel" />
            <FeatureItem text="Stratégies d'engagement optimisées" />
            <FeatureItem text="Analyse des tendances de votre niche" />
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={goPro}>
            <Crown size={20} color="#fff" />
            <Text style={styles.upgradeButtonText}>Passer Pro</Text>
          </TouchableOpacity>
          
          <Text style={styles.paywallFooter}>
            Déverrouillez le chat TikTok avec votre abonnement Pro.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main chat interface (simplified like chat.tsx)
  return (
    <SafeAreaView 
      key={conversationId || 'new'}
      style={styles.container} 
      edges={[]}
    >
      {/* Header with reset button for testing */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {conversationTitle ? conversationTitle : 'Nouveau chat'}
        </Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetConversation}
        >
          <RefreshCw size={16} color="#007AFF" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <View style={styles.welcomeMessage}>
            <TrendingUp size={24} color="#007AFF" />
            <Text style={styles.welcomeText}>
              {existingAnalysis ? (
                `👋 Salut ! Je connais votre compte @${existingAnalysis.tiktok_handle} et peux vous donner des conseils personnalisés basés sur votre analyse TikTok.`
              ) : (
                `👋 Salut ! Je suis votre expert TikTok IA. Posez-moi des questions sur la stratégie de contenu, l'engagement, ou donnez-moi votre handle TikTok pour une analyse personnalisée.`
              )}
            </Text>
          </View>
        )}

        {/* Error display */}
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#ff5555" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        {messages.map(renderMessage)}
        
        {/* Loading/Streaming indicator */}
        {(isLoading || isStreaming) && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.typingText}>
              {isStreaming ? 'L\'IA écrit...' : 'L\'IA réfléchit...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Section (simplified like chat.tsx) */}
      <View style={styles.inputContainer}>
        {/* Suggestions for first message */}
        {messages.length === 0 && (
          <View style={styles.suggestionsContainer}>
            {existingAnalysis ? (
              <>
                <TouchableOpacity 
                  style={styles.suggestionCard}
                  onPress={() => setInputMessage(`Quels sont mes points forts sur @${existingAnalysis.tiktok_handle} ?`)}
                >
                  <Text style={styles.suggestionTitle}>Mes points forts</Text>
                  <Text style={styles.suggestionSubtitle}>Analyse de mes forces</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionCard}
                  onPress={() => setInputMessage("Comment améliorer mon engagement ?")}
                >
                  <Text style={styles.suggestionTitle}>Améliorer l'engagement</Text>
                  <Text style={styles.suggestionSubtitle}>Conseils personnalisés</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.suggestionCard}
                  onPress={() => setInputMessage("Analyse mon compte @username")}
                >
                  <Text style={styles.suggestionTitle}>Analyser un compte</Text>
                  <Text style={styles.suggestionSubtitle}>@username pour analyse complète</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionCard}
                  onPress={() => setInputMessage("Comment améliorer mon engagement ?")}
                >
                  <Text style={styles.suggestionTitle}>Conseils d'engagement</Text>
                  <Text style={styles.suggestionSubtitle}>Stratégies personnalisées</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Posez une question ou donnez votre handle TikTok..."
            placeholderTextColor="#888"
            multiline
            maxLength={500}
            editable={!isLoading && !isStreaming}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isLoading || isStreaming) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isStreaming}
          >
            {(isLoading || isStreaming) ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Helper Components
function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centeredText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Paywall Styles (simplified)
  paywallContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%',
  },
  paywallHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  paywallDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  paywallFooter: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Chat Styles (like working chat.tsx)
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    marginBottom: 20,
    gap: 12,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.3)',
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff5555',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  errorDismissText: {
    color: '#ff5555',
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  typingText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Input Styles (like working chat.tsx)
  inputContainer: {
    padding: 20,
    paddingTop: 10,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 