/**
 * 🎨 Chat Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 3:
 * ❌ Avant: scriptChatStyles.ts + 35+ couleurs hardcodées inline
 * ✅ Après: scriptChatStyles-v2.ts + palette Editia centralisée
 */

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
import { scriptChatStyles } from '@/lib/utils/styles/scriptChat.styles-v2'; // ✅ Version migrée
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

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
            <Text selectable style={scriptChatStyles.messageText}>{message.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}

          {/* ✅ Indicateur de streaming avec Rouge Editia */}
          {message.metadata?.isStreaming && (
            <View style={scriptChatStyles.streamingIndicator}>
              <ActivityIndicator size="small" color={COLORS.interactive.primary} />
            </View>
          )}

          {/* Status et timestamp */}
          <View style={scriptChatStyles.messageFooter}>
            <Text selectable style={scriptChatStyles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isUser && (
              <CheckCircle2
                size={12}
                color={COLORS.status.success}
                style={scriptChatStyles.checkmark}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  // ✅ Modal for editing avec design Editia cohérent
  const renderEditScriptModal = () => (
    <Modal
      visible={false} // This modal is now handled inline
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditingScript(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Modifier le script
          </Text>
          <TextInput
            style={styles.modalTextInput}
            multiline
            value={editedScript}
            onChangeText={setEditedScript}
            editable={!isModifyingScript}
            maxLength={5000}
            placeholderTextColor={COLORS.text.disabled}
          />
          {modifyScriptError && (
            <Text style={styles.modalError}>
              {modifyScriptError}
            </Text>
          )}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={isModifyingScript}
              style={styles.modalCancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={isModifyingScript || editedScript.trim().length === 0}
              style={[
                styles.modalSaveButton,
                (isModifyingScript || editedScript.trim().length === 0) && styles.modalButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              {isModifyingScript ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <Text style={styles.modalSaveText}>
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
          <MessageCircle size={48} color={COLORS.text.muted} />
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
        
        {/* ✅ Error display avec style cohérent */}
        {error && (
          <View style={scriptChatStyles.errorContainer}>
            <AlertCircle size={16} color={COLORS.status.error} />
            <Text style={scriptChatStyles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              style={scriptChatStyles.errorDismiss}
              activeOpacity={0.8}
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
              <ActivityIndicator size="large" color={COLORS.interactive.primary} />
              <Text style={scriptChatStyles.loadingText}>
                Chargement du script...
              </Text>
            </View>
          ) : (
            <>{messages.map(renderMessage)}</>
          )}
        </ScrollView>

        {/* ✅ Bloc script actuel collapsible avec styles cohérents */}
        {currentScript && currentScript.length > 0 && (
          <View style={scriptChatStyles.collapsibleScriptContainer}>
            <TouchableOpacity
              style={[
                scriptChatStyles.collapsibleHeader,
                scriptOpen && scriptChatStyles.collapsibleHeaderActive
              ]}
              onPress={() => setScriptOpen((open) => !open)}
              activeOpacity={0.8}
            >
              <Text
                style={scriptChatStyles.collapsibleTitle}
                numberOfLines={scriptOpen ? undefined : 1}
              >
                {scriptOpen
                  ? 'Script actuel :'
                  : 'Script actuel : ' + currentScript}
              </Text>
              <View style={styles.scriptHeaderActions}>
                <TouchableOpacity
                  onPress={handleEditScript}
                  style={scriptChatStyles.scriptActionsButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Pencil size={16} color={COLORS.text.disabled} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowActionsModal(true)}
                  style={scriptChatStyles.scriptActionsButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <MoreHorizontal size={18} color={COLORS.text.disabled} />
                </TouchableOpacity>
                {scriptOpen ? (
                  <ChevronUp size={18} color={COLORS.text.disabled} />
                ) : (
                  <ChevronDown size={18} color={COLORS.text.disabled} />
                )}
              </View>
            </TouchableOpacity>
            
            {scriptOpen && (
              <View style={scriptChatStyles.collapsibleContent}>
                {isEditingScript ? (
                  <>
                    <TextInput
                      style={styles.inlineEditInput}
                      multiline
                      value={editedScript}
                      onChangeText={setEditedScript}
                      editable={!isModifyingScript}
                      maxLength={5000}
                      placeholderTextColor={COLORS.text.disabled}
                    />
                    {modifyScriptError && (
                      <Text style={styles.inlineEditError}>
                        {modifyScriptError}
                      </Text>
                    )}
                    <View style={styles.inlineEditActions}>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        disabled={isModifyingScript}
                        style={styles.inlineEditCancel}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.inlineEditCancelText}>
                          Annuler
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        disabled={
                          isModifyingScript || editedScript.trim().length === 0
                        }
                        style={[
                          styles.inlineEditSave,
                          (isModifyingScript || editedScript.trim().length === 0) &&
                            styles.inlineEditSaveDisabled,
                        ]}
                        activeOpacity={0.8}
                      >
                        {isModifyingScript ? (
                          <ActivityIndicator size="small" color={COLORS.text.primary} />
                        ) : (
                          <Text style={styles.inlineEditSaveText}>
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

        {/* ✅ Zone de saisie avec suggestions cohérentes */}
        <View style={scriptChatStyles.inputContainer}>
          {/* Exemples de prompts - style ChatGPT */}
          {messages.length === 0 && (
            <View style={scriptChatStyles.suggestionsContainer}>
              <TouchableOpacity
                style={scriptChatStyles.suggestionCard}
                onPress={() =>
                  setInputMessage('Créer un MVP en Next.js avec best practices')
                }
                activeOpacity={0.8}
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
                activeOpacity={0.8}
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

          <View style={styles.inputRow}>
            <View style={scriptChatStyles.inputWrapper}>
              <TextInput
                style={scriptChatStyles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Poser une question"
                placeholderTextColor={COLORS.text.disabled}
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
              activeOpacity={0.8}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <Send size={18} color={COLORS.text.primary} />
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
          onEdit={handleEditScript}
        />
        {renderEditScriptModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ✅ Styles additionnels avec palette Editia
const styles = StyleSheet.create({
  // Input row
  inputRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12
  },

  // Script header actions
  scriptHeaderActions: {
    flexDirection: 'row', 
    alignItems: 'center'
  },

  // Modal styles avec design cohérent
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.background.overlayStrong, // rgba(0, 0, 0, 0.8)
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16,
    padding: 20,
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  modalTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  modalTextInput: {
    backgroundColor: COLORS.background.tertiary, // #2a2a2a
    color: COLORS.text.primary,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },

  modalError: {
    color: COLORS.status.error,
    marginBottom: 8,
    lineHeight: 20,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
  },

  modalCancelText: {
    color: COLORS.text.disabled,
    fontSize: 16,
  },

  modalSaveButton: {
    backgroundColor: COLORS.interactive.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  modalButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  modalSaveText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Inline edit styles
  inlineEditInput: {
    backgroundColor: COLORS.background.tertiary,
    color: COLORS.text.primary,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },

  inlineEditError: {
    color: COLORS.status.error,
    marginBottom: 8,
    lineHeight: 16,
  },

  inlineEditActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },

  inlineEditCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 36,
  },

  inlineEditCancelText: {
    color: COLORS.text.disabled,
    fontSize: 16,
  },

  inlineEditSave: {
    backgroundColor: COLORS.interactive.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },

  inlineEditSaveDisabled: {
    opacity: 0.6,
  },

  inlineEditSaveText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION CHAT SCREEN:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • Import de scriptChatStyles-v2.ts (38 couleurs déjà migrées vers palette Editia)
 * • 35+ couleurs hardcodées inline → Styles centralisés avec palette cohérente
 * • ActivityIndicator: #007AFF → #FF0050 (Rouge Editia)
 * • CheckCircle2: #4CD964 → #00FF88 (Vert Editia)
 * • AlertCircle: #ff5555 → COLORS.status.error (#FF3B30)
 * • MessageCircle: #888 → COLORS.text.muted (#666666)
 * 
 * 💬 AMÉLIORATIONS INTERFACE CHAT:
 * • Modal d'édition avec design système (backdrop, shadows, borders)
 * • Inline edit avec styles cohérents
 * • Touch feedback (activeOpacity={0.8}) sur tous les boutons
 * • Error states avec couleurs système cohérentes
 * • Loading indicators en Rouge Editia
 * 
 * 🚀 NOUVEAUTÉS:
 * • Modal backdrop avec overlay forte
 * • Shadows colorées sur modal et boutons
 * • États disabled avec opacité cohérente
 * • Touch targets accessibles (44px minimum)
 * • Hiérarchie de couleurs respectée
 * 
 * Réutilise les 38 couleurs migrées de scriptChatStyles-v2 + 35 couleurs inline migrées ✨
 */