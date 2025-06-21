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
import { Send, MessageCircle, CheckCircle2, CheckCircle, Clock, Database, Video, MoreHorizontal, Copy, Trash2 } from 'lucide-react-native';
import { useScriptChat } from '@/app/hooks/useScriptChat';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import ScriptActionsModal from '@/components/ScriptActionsModal';
import StreamingStatus from '@/components/StreamingStatus';

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
export default function ScriptChatDemo() {
  const { isSignedIn } = useAuth();
  const { scriptId, new: isNewChat } = useLocalSearchParams<{ scriptId?: string; new?: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Utiliser le vrai hook avec options
  const {
    messages,
    currentScript,
    isLoading,
    isStreaming,
    error,
    streamingStatus,
    sendMessage,
    createNewScript,
    validateScript,
    duplicateScript,
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
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    
    try {
      await sendMessage(inputMessage.trim());
      setInputMessage('');
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
        'Veuillez d\'abord créer un script avant de générer une vidéo.',
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
          
          {/* Indicateur de streaming */}
          {message.metadata?.isStreaming && (
            <View style={styles.streamingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.streamingText}>En cours de frappe...</Text>
            </View>
          )}
          
          {/* Status et timestamp */}
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
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={styles.centeredText}>Connectez-vous pour utiliser le Script Chat</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {(() => {
          console.log('🎯 Render condition check:', {
            isLoading,
            messagesLength: messages.length,
            showLoading: isLoading && messages.length === 0,
            showContent: !(isLoading && messages.length === 0)
          });
          return null;
        })()}
        {isLoading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Chargement du script...</Text>
          </View>
        ) : (
          <>
            {messages.map(renderMessage)}
            
            {/* Script prévisualisation */}
            {(() => {
              console.log('🎯 Script preview check:', { 
                currentScript: currentScript ? currentScript.substring(0, 50) + '...' : 'EMPTY',
                currentScriptLength: currentScript?.length || 0,
                scriptDraft: scriptDraft?.id || 'NO_DRAFT'
              });
              return null;
            })()}
            {currentScript && (
              <View style={styles.scriptPreview}>
                <View style={styles.scriptHeader}>
                  <Text style={styles.scriptTitle}>📝 Script Actuel</Text>
                  {scriptDraft && (
                    <TouchableOpacity 
                      onPress={() => setShowActionsModal(true)}
                      style={styles.scriptActionsButton}
                    >
                      <MoreHorizontal size={16} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.scriptContent}>{currentScript}</Text>
                <Text style={styles.scriptMeta}>
                  {wordCount} mots • ~{Math.round(estimatedDuration)} secondes
                </Text>
              </View>
            )}
          </>
        )}
        
        {/* Indicateur de frappe global */}
        {isStreaming && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.typingText}>L'IA analyse votre profil éditorial...</Text>
          </View>
        )}
      </ScrollView>

      {/* Zone de saisie style ChatGPT */}
      <View style={styles.inputContainer}>
        {/* Exemples de prompts - style ChatGPT */}
        {messages.length === 0 && (
          <View style={styles.suggestionsContainer}>
            <TouchableOpacity 
              style={styles.suggestionCard}
              onPress={() => setInputMessage("Créer un MVP en Next.js avec best practices")}
            >
              <Text style={styles.suggestionTitle}>Créer un MVP</Text>
              <Text style={styles.suggestionSubtitle}>en Next.js avec best practices</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.suggestionCard}
              onPress={() => setInputMessage("Trouver un positionnement pour un SaaS éducatif")}
            >
              <Text style={styles.suggestionTitle}>Trouver un positionnement</Text>
              <Text style={styles.suggestionSubtitle}>pour un SaaS éducatif</Text>
            </TouchableOpacity>
          </View>
        )}

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
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isStreaming) && styles.sendButtonDisabled
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
    color: '#888',
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
    backgroundColor: '#333',
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
}); 