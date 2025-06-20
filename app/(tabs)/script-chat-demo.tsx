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
import { Send, MessageCircle, CheckCircle2, Clock, Database, Video } from 'lucide-react-native';
import { useScriptChat } from '@/app/hooks/useScriptChat';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';

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
  const { scriptId } = useLocalSearchParams<{ scriptId?: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Utiliser le vrai hook avec options
  const {
    messages,
    currentScript,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    createNewScript,
    clearError,
    wordCount,
    estimatedDuration,
    title,
    scriptDraft,
  } = useScriptChat({
    scriptId: scriptId,
    outputLanguage: 'fr',
    // editorialProfileId sera récupéré automatiquement du user
  });

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header avec informations script */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MessageCircle size={24} color="#007AFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {title || 'Nouveau Script'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isStreaming ? (
                '🤖 IA en train d\'écrire...'
              ) : scriptDraft ? (
                `💾 Sauvé • ${wordCount} mots • ${Math.round(estimatedDuration)}s`
              ) : (
                '✨ Profil éditorial intégré'
              )}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {scriptDraft && (
            <View style={styles.dbIndicator}>
              <Database size={16} color="#4CD964" />
            </View>
          )}
          
          <TouchableOpacity 
            onPress={handleCreateNew}
            style={styles.newButton}
            disabled={isLoading}
          >
            <Text style={styles.newButtonText}>Nouveau</Text>
          </TouchableOpacity>
        </View>
      </View>

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
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateVideo}
                  >
                    <Video size={16} color="#fff" />
                    <Text style={styles.generateButtonText}>Générer Vidéo</Text>
                  </TouchableOpacity>
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

      {/* Zone de saisie */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder={
              messages.length === 0 
                ? "Décrivez le script que vous souhaitez créer..."
                : "Affinez votre script..."
            }
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
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Exemples de prompts */}
        {messages.length === 0 && (
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>💡 Exemples :</Text>
            <View style={styles.examplesRow}>
              <TouchableOpacity 
                style={styles.exampleChip}
                onPress={() => setInputMessage("Script sur les bienfaits du café")}
              >
                <Text style={styles.exampleText}>☕ Café</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exampleChip}
                onPress={() => setInputMessage("3 astuces productivité")}
              >
                <Text style={styles.exampleText}>⚡ Productivité</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exampleChip}
                onPress={() => setInputMessage("Expliquer l'IA simplement")}
              >
                <Text style={styles.exampleText}>🤖 IA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dbIndicator: {
    padding: 4,
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  examplesContainer: {
    marginTop: 12,
  },
  examplesTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  examplesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exampleChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  exampleText: {
    fontSize: 12,
    color: '#888',
  },
}); 