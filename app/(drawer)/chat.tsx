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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  MessageCircle,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useScriptChat } from '@/app/hooks/useScriptChat';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import ScriptActionsModal from '@/components/ScriptActionsModal';
import Markdown from 'react-native-markdown-display';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';

/**
 * 🎯 SCRIPT CHAT AVEC VRAIE API ET PROFIL ÉDITORIAL
 *
 * Cette version utilise :
 * 1. Hook useScriptChat pour vraie API backend
 * 2. Profil éditorial pour contexte personnalisé
 * 3. Prompt design structuré (Parahelp inspired)
 * 4. Sauvegarde automatique en DB
 * 5. Streaming temps réel OpenAI
 */
export default function ScriptChat() {
  const { isSignedIn } = useAuth();
  const { scriptId, new: isNewChat } = useLocalSearchParams<{
    scriptId?: string;
    new?: string;
  }>();
  const [inputMessage, setInputMessage] = useState('');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scriptOpen, setScriptOpen] = useState(false);

  // Utiliser le vrai hook avec options
  const {
    messages,
    currentScript,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    createNewScript,
    validateScript,
    deleteScript,
    clearError,
    wordCount,
    estimatedDuration,
    title,
    scriptDraft,
  } = useScriptChat({
    scriptId: isNewChat ? undefined : scriptId, // Force new chat if new param present
    outputLanguage: 'fr',
    // editorialProfileId sera récupéré automatiquement du user
  });

  // Create new chat when new parameter is present
  useEffect(() => {
    if (isNewChat && !isLoading) {
      createNewScript();
      // Clean up URL by removing the new parameter
      router.replace('/chat');
    }
  }, [isNewChat, isLoading, createNewScript]);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    const messageToSend = inputMessage.trim();
    setInputMessage(''); // Vide l'input tout de suite
    try {
      await sendMessage(messageToSend);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleCreateNew = async () => {
    try {
      await createNewScript();
      setInputMessage('');
    } catch (err) {
      console.error('Error creating new script:', err);
    }
  };

  const handleGenerateVideo = () => {
    if (!currentScript || !scriptDraft) {
      Alert.alert(
        'Script requis',
        "Veuillez d'abord créer un script avant de générer une vidéo.",
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to video settings screen with script data
    router.push({
      pathname: '/script-video-settings',
      params: {
        scriptId: scriptDraft.id,
        script: currentScript,
        wordCount: wordCount.toString(),
        estimatedDuration: estimatedDuration.toString(),
        title: title,
      },
    });
  };

  const renderMessage = (message: any) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {isUser ? (
            <Text style={styles.messageText}>{message.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}

          {/* Indicateur de streaming */}
          {message.metadata?.isStreaming && (
            <View style={styles.streamingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}

          {/* Status et timestamp */}
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isUser && (
              <CheckCircle2
                size={12}
                color="#4CD964"
                style={styles.checkmark}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={styles.centeredText}>
            Connectez-vous pour utiliser le Script Chat
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <AnalysisHeader
          title={title || 'Nouveau Chat'}
          showBackButton={true}
          onBack={() => router.push('/(drawer)/scripts')}
        />
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Chargement du script...</Text>
            </View>
          ) : (
            <>{messages.map(renderMessage)}</>
          )}

          {/* Indicateur de frappe global */}
          {isStreaming && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
              <Text style={styles.typingText}>
                EditIA analyse votre profil éditorial...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bloc script actuel collapsible juste au-dessus de l'input */}
        {currentScript && currentScript.length > 0 && (
          <View style={styles.collapsibleScriptContainer}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setScriptOpen((open) => !open)}
              activeOpacity={0.7}
            >
              <Text
                style={styles.collapsibleTitle}
                numberOfLines={scriptOpen ? undefined : 1}
              >
                {scriptOpen
                  ? 'Script actuel :'
                  : 'Script actuel : ' + currentScript}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setShowActionsModal(true)}
                  style={styles.scriptActionsButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MoreHorizontal size={18} color="#888" />
                </TouchableOpacity>
                {scriptOpen ? (
                  <ChevronUp size={18} color="#888" />
                ) : (
                  <ChevronDown size={18} color="#888" />
                )}
              </View>
            </TouchableOpacity>
            {scriptOpen && (
              <View style={styles.collapsibleContent}>
                <Text style={styles.collapsibleScriptText}>
                  {currentScript}
                </Text>
                <Text style={styles.collapsibleMeta}>
                  {wordCount} mots • ~{Math.round(estimatedDuration)} secondes
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Zone de saisie style ChatGPT */}
        <View style={styles.inputContainer}>
          {/* Exemples de prompts - style ChatGPT */}
          {messages.length === 0 && (
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity
                style={styles.suggestionCard}
                onPress={() =>
                  setInputMessage('Créer un MVP en Next.js avec best practices')
                }
              >
                <Text style={styles.suggestionTitle}>Créer un MVP</Text>
                <Text style={styles.suggestionSubtitle}>
                  en Next.js avec best practices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionCard}
                onPress={() =>
                  setInputMessage(
                    'Trouver un positionnement pour un SaaS éducatif'
                  )
                }
              >
                <Text style={styles.suggestionTitle}>
                  Trouver un positionnement
                </Text>
                <Text style={styles.suggestionSubtitle}>
                  pour un SaaS éducatif
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Poser une question"
                  placeholderTextColor="#888"
                  multiline
                  maxLength={500}
                  editable={!isStreaming}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isStreaming) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isStreaming}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Modal */}
        <ScriptActionsModal
          script={scriptDraft}
          visible={showActionsModal}
          onClose={() => setShowActionsModal(false)}
          onScriptDeleted={async () => {
            setShowActionsModal(false);
            await deleteScript();
            router.back();
          }}
          onScriptDuplicated={async (newScript: any) => {
            setShowActionsModal(false);
            router.push({
              pathname: '/chat',
              params: { scriptId: newScript.id },
            });
          }}
          onValidate={validateScript}
          onGenerateVideo={handleGenerateVideo}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 6,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bullet_list_icon: {
    color: '#007AFF',
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    fontWeight: 'bold',
  },
  ordered_list_icon: {
    color: '#007AFF',
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    fontWeight: 'bold',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

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

  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
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
    color: '#fff',
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#fff',
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  streamingText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#fff',
  },
  checkmark: {
    marginLeft: 4,
  },
  scriptPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  scriptActionsButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginRight: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scriptContent: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 8,
  },
  scriptMeta: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
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
    width: '85%',
    gap: 12,
  },
  inputRow: {
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

  scriptActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  collapsibleScriptContainer: {
    backgroundColor: '#181818',
    borderRadius: 10,
    margin: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  collapsibleTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  collapsibleContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  collapsibleScriptText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  collapsibleMeta: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
