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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  MessageCircle,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pencil,
} from 'lucide-react-native';
import { useScriptChat } from '@/app/hooks/useScriptChat';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import ScriptActionsModal from '@/components/ScriptActionsModal';
import Markdown from 'react-native-markdown-display';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import VoiceDictation from '@/components/VoiceDictation';
import { markdownStyles } from '@/lib/utils/styles/accountChat.styles';
import { scriptChatStyles } from '@/lib/utils/styles/scriptChat.styles';
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
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState('');

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
    modifyCurrentScript,
    isModifyingScript,
    modifyScriptError,
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

  const handleEditScript = () => {
    setScriptOpen(true);
    setEditedScript(currentScript);
    setIsEditingScript(true);
  };
  const handleCancelEdit = () => {
    setIsEditingScript(false);
    setEditedScript('');
  };
  const handleSaveEdit = async () => {
    await modifyCurrentScript(editedScript);
    if (!modifyScriptError) {
      setIsEditingScript(false);
    }
  };

  const renderMessage = (message: any) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          scriptChatStyles.messageContainer,
          isUser
            ? scriptChatStyles.userMessage
            : scriptChatStyles.assistantMessage,
        ]}
      >
        <View
          style={[
            scriptChatStyles.messageBubble,
            isUser
              ? scriptChatStyles.userBubble
              : scriptChatStyles.assistantBubble,
          ]}
        >
          {isUser ? (
            <Text style={scriptChatStyles.messageText}>{message.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}

          {/* Indicateur de streaming */}
          {message.metadata?.isStreaming && (
            <View style={scriptChatStyles.streamingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}

          {/* Status et timestamp */}
          <View style={scriptChatStyles.messageFooter}>
            <Text style={scriptChatStyles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isUser && (
              <CheckCircle2
                size={12}
                color="#4CD964"
                style={scriptChatStyles.checkmark}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  // Modal for editing the current script
  const renderEditScriptModal = () => (
    <Modal
      visible={false} // This modal is now handled inline
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditingScript(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#181818',
            borderRadius: 12,
            padding: 20,
            width: '90%',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 12,
            }}
          >
            Modifier le script
          </Text>
          <TextInput
            style={{
              backgroundColor: '#222',
              color: '#fff',
              borderRadius: 8,
              padding: 12,
              minHeight: 120,
              textAlignVertical: 'top',
              fontSize: 16,
              marginBottom: 12,
            }}
            multiline
            value={editedScript}
            onChangeText={setEditedScript}
            editable={!isModifyingScript}
            maxLength={5000}
          />
          {modifyScriptError && (
            <Text style={{ color: '#ff5555', marginBottom: 8 }}>
              {modifyScriptError}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={isModifyingScript}
              style={{ paddingVertical: 8, paddingHorizontal: 16 }}
            >
              <Text style={{ color: '#888', fontSize: 16 }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={isModifyingScript || editedScript.trim().length === 0}
              style={{
                backgroundColor: '#007AFF',
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 16,
                opacity:
                  isModifyingScript || editedScript.trim().length === 0
                    ? 0.6
                    : 1,
              }}
            >
              {isModifyingScript ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
                >
                  Enregistrer
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!isSignedIn) {
    return (
      <SafeAreaView style={scriptChatStyles.container} edges={['top']}>
        <View style={scriptChatStyles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={scriptChatStyles.centeredText}>
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={scriptChatStyles.container} edges={['top']}>
        <AnalysisHeader
          title={title || 'Nouveau Chat'}
          showBackButton={true}
          onBack={() => router.push('/(drawer)/scripts')}
        />
        {/* Error display */}
        {error && (
          <View style={scriptChatStyles.errorContainer}>
            <AlertCircle size={16} color="#ff5555" />
            <Text style={scriptChatStyles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              style={scriptChatStyles.errorDismiss}
            >
              <Text style={scriptChatStyles.errorDismissText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={scriptChatStyles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && messages.length === 0 ? (
            <View style={scriptChatStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={scriptChatStyles.loadingText}>
                Chargement du script...
              </Text>
            </View>
          ) : (
            <>{messages.map(renderMessage)}</>
          )}
        </ScrollView>

        {/* Bloc script actuel collapsible juste au-dessus de l'input */}
        {currentScript && currentScript.length > 0 && (
          <View style={scriptChatStyles.collapsibleScriptContainer}>
            <TouchableOpacity
              style={scriptChatStyles.collapsibleHeader}
              onPress={() => setScriptOpen((open) => !open)}
              activeOpacity={0.7}
            >
              <Text
                style={scriptChatStyles.collapsibleTitle}
                numberOfLines={scriptOpen ? undefined : 1}
              >
                {scriptOpen
                  ? 'Script actuel :'
                  : 'Script actuel : ' + currentScript}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={handleEditScript}
                  style={scriptChatStyles.scriptActionsButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Pencil size={16} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowActionsModal(true)}
                  style={scriptChatStyles.scriptActionsButton}
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
              <View style={scriptChatStyles.collapsibleContent}>
                {isEditingScript ? (
                  <>
                    <TextInput
                      style={{
                        backgroundColor: '#222',
                        color: '#fff',
                        borderRadius: 8,
                        padding: 12,
                        minHeight: 100,
                        textAlignVertical: 'top',
                        fontSize: 16,
                        marginBottom: 12,
                      }}
                      multiline
                      value={editedScript}
                      onChangeText={setEditedScript}
                      editable={!isModifyingScript}
                      maxLength={5000}
                    />
                    {modifyScriptError && (
                      <Text style={{ color: '#ff5555', marginBottom: 8 }}>
                        {modifyScriptError}
                      </Text>
                    )}
                    <View
                      style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}
                    >
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        disabled={isModifyingScript}
                        style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                      >
                        <Text style={{ color: '#888', fontSize: 16 }}>
                          Annuler
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        disabled={
                          isModifyingScript || editedScript.trim().length === 0
                        }
                        style={{
                          backgroundColor: '#007AFF',
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          opacity:
                            isModifyingScript ||
                            editedScript.trim().length === 0
                              ? 0.6
                              : 1,
                        }}
                      >
                        {isModifyingScript ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 16,
                              fontWeight: '600',
                            }}
                          >
                            Enregistrer
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={scriptChatStyles.collapsibleScriptText}>
                      {currentScript}
                    </Text>
                    <Text style={scriptChatStyles.collapsibleMeta}>
                      {wordCount} mots • ~{Math.round(estimatedDuration)}{' '}
                      secondes
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Zone de saisie style ChatGPT */}
        <View style={scriptChatStyles.inputContainer}>
          {/* Exemples de prompts - style ChatGPT */}
          {messages.length === 0 && (
            <View style={scriptChatStyles.suggestionsContainer}>
              <TouchableOpacity
                style={scriptChatStyles.suggestionCard}
                onPress={() =>
                  setInputMessage('Créer un MVP en Next.js avec best practices')
                }
              >
                <Text style={scriptChatStyles.suggestionTitle}>
                  Créer un MVP
                </Text>
                <Text style={scriptChatStyles.suggestionSubtitle}>
                  en Next.js avec best practices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={scriptChatStyles.suggestionCard}
                onPress={() =>
                  setInputMessage(
                    'Trouver un positionnement pour un SaaS éducatif'
                  )
                }
              >
                <Text style={scriptChatStyles.suggestionTitle}>
                  Trouver un positionnement
                </Text>
                <Text style={scriptChatStyles.suggestionSubtitle}>
                  pour un SaaS éducatif
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={scriptChatStyles.inputWrapper}>
              <TextInput
                style={scriptChatStyles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Poser une question"
                placeholderTextColor="#888"
                multiline
                maxLength={500}
                editable={!isStreaming}
              />
              <VoiceDictation
                currentValue={inputMessage}
                onTranscriptChange={setInputMessage}
              />
            </View>
            <TouchableOpacity
              style={[
                scriptChatStyles.sendButton,
                (!inputMessage.trim() || isStreaming) &&
                  scriptChatStyles.sendButtonDisabled,
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
          // Add edit handler
          onEdit={handleEditScript}
        />
        {renderEditScriptModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
