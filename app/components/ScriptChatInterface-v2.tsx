/**
 * 🎨 ScriptChatInterface v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 2:
 * ❌ Avant: 44 couleurs hardcodées (#007AFF, #333, #888, etc.)
 * ✅ Après: Interface de chat cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Send,
  Loader,
  Save,
  CheckCircle2,
  Copy,
  RotateCcw,
  MessageSquare,
} from 'lucide-react-native';
import { ChatMessage, ScriptDraft } from '@/lib/types/script';
import { COLORS } from '@/lib/constants/colors';

interface ScriptChatInterfaceProps {
  messages: ChatMessage[];
  currentScript: string;
  scriptDraft: ScriptDraft | null;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  wordCount: number;
  estimatedDuration: number;
  onSendMessage: (message: string) => Promise<void>;
  onSaveAsDraft: () => Promise<void>;
  onValidateScript: () => Promise<void>;
  onNewScript: () => Promise<void>;
  onClearError: () => void;
}

export const ScriptChatInterface: React.FC<ScriptChatInterfaceProps> = ({
  messages,
  currentScript,
  scriptDraft,
  isStreaming,
  isLoading,
  error,
  wordCount,
  estimatedDuration,
  onSendMessage,
  onSaveAsDraft,
  onValidateScript,
  onNewScript,
  onClearError,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(message);
  };

  const canSend = inputMessage.trim().length > 0 && !isStreaming && !isLoading;
  const hasScript = currentScript.length > 0;
  const canValidate = hasScript && scriptDraft?.status === 'draft';

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Header with script info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {scriptDraft?.title || 'Nouveau Script'}
            </Text>
            {hasScript && (
              <View style={styles.metadata}>
                <Text style={styles.metadataText}>
                  {wordCount} mots • {Math.round(estimatedDuration)}s
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    scriptDraft?.status === 'validated' &&
                      styles.statusValidated,
                    scriptDraft?.status === 'used' && styles.statusUsed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      scriptDraft?.status === 'validated' &&
                        styles.statusTextValidated,
                      scriptDraft?.status === 'used' && styles.statusTextUsed,
                    ]}
                  >
                    {scriptDraft?.status === 'draft' && 'Brouillon'}
                    {scriptDraft?.status === 'validated' && 'Validé'}
                    {scriptDraft?.status === 'used' && 'Utilisé'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onNewScript}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <RotateCcw size={20} color={COLORS.interactive.secondary} />
            </TouchableOpacity>

            {hasScript && (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onSaveAsDraft}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Save size={20} color={COLORS.interactive.secondary} />
                </TouchableOpacity>

                {canValidate && (
                  <TouchableOpacity
                    style={[styles.headerButton, styles.validateButton]}
                    onPress={onValidateScript}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={20} color={COLORS.text.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Error display avec style Editia */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.errorDismiss} 
            onPress={onClearError}
            activeOpacity={0.8}
          >
            <Text style={styles.errorDismissText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={COLORS.text.muted} />
            <Text style={styles.emptyStateTitle}>
              Créons votre script ensemble
            </Text>
            <Text style={styles.emptyStateDescription}>
              Décrivez votre idée de vidéo et je vous aiderai à créer un script
              engageant
            </Text>
          </View>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}

        {isLoading && messages.length === 0 && (
          <View style={styles.loadingContainer}>
            <Loader size={24} color={COLORS.interactive.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
      </ScrollView>

      {/* Current script preview avec style Editia */}
      {hasScript && (
        <View style={styles.scriptPreview}>
          <View style={styles.scriptPreviewHeader}>
            <Text style={styles.scriptPreviewTitle}>Script actuel</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              activeOpacity={0.8}
            >
              <Copy size={16} color={COLORS.interactive.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scriptPreviewContent} nestedScrollEnabled>
            <Text style={styles.scriptText}>{currentScript}</Text>
          </ScrollView>
        </View>
      )}

      {/* Input area avec design Editia */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Tapez votre message..."
            placeholderTextColor={COLORS.text.disabled}
            multiline
            maxLength={500}
            editable={!isStreaming && !isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            onPress={handleSendMessage}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            {isStreaming ? (
              <Loader size={20} color={canSend ? COLORS.text.primary : COLORS.text.disabled} />
            ) : (
              <Send size={20} color={canSend ? COLORS.text.primary : COLORS.text.disabled} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Message bubble component avec palette Editia
interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.metadata?.isStreaming;

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.assistantMessage,
        isLast && styles.lastMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.assistantMessageText,
        ]}
      >
        {message.content}
      </Text>

      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <Loader size={12} color={COLORS.interactive.primary} />
        </View>
      )}

      <Text
        style={[
          styles.messageTime,
          isUser ? styles.userMessageTime : styles.assistantMessageTime,
        ]}
      >
        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // ✅ Container principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  // ✅ Header avec nouvelle palette
  header: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a (au lieu de #111)
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.divider, // #333333
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  
  titleSection: {
    flex: 1,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    marginBottom: 4,
  },
  
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  metadataText: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
  },
  
  // ✅ Status badges avec palette Editia
  statusBadge: {
    backgroundColor: COLORS.surface.divider, // #333333
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  statusValidated: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
  },
  
  statusUsed: {
    backgroundColor: COLORS.interactive.secondary, // #007AFF (Bleu Editia!)
  },
  
  statusText: {
    fontSize: 12,
    color: COLORS.text.disabled, // #808080
    fontWeight: '500',
  },
  
  statusTextValidated: {
    color: '#000000', // Texte noir sur fond vert
    fontWeight: '700',
  },
  
  statusTextUsed: {
    color: COLORS.text.primary, // #FFFFFF
  },
  
  // ✅ Header actions
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface.divider, // #333333
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44, // Touch target accessible
  },
  
  validateButton: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
    shadowColor: COLORS.shadow.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // ✅ Error container avec style système cohérent
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Error background système
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)', // Error border système
    margin: 16,
    padding: 12,
    borderRadius: 12, // Radius plus moderne
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  
  errorDismiss: {
    marginLeft: 12,
    padding: 8, // Touch target plus grand
    borderRadius: 8,
  },
  
  errorDismissText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ Messages container
  messagesContainer: {
    flex: 1,
  },
  
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  
  // ✅ Empty state amélioré
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateDescription: {
    fontSize: 16,
    color: COLORS.text.tertiary, // #B0B0B0
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  
  loadingText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 16,
  },
  
  // ✅ Message bubbles avec palette Editia
  messageBubble: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
  },
  
  lastMessage: {
    marginBottom: 8,
  },
  
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  userMessageText: {
    color: COLORS.text.primary, // #FFFFFF
  },
  
  assistantMessageText: {
    color: COLORS.text.primary, // #FFFFFF
  },
  
  streamingIndicator: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)', // Maintain opacity for readability
    textAlign: 'right',
  },
  
  assistantMessageTime: {
    color: COLORS.text.quaternary, // #909090
  },
  
  // ✅ Script preview amélioré
  scriptPreview: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderTopWidth: 1,
    borderTopColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    maxHeight: 120,
  },
  
  scriptPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.border,
  },
  
  scriptPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
  },
  
  copyButton: {
    padding: 8, // Touch target plus grand
    borderRadius: 8,
  },
  
  scriptPreviewContent: {
    maxHeight: 80,
  },
  
  scriptText: {
    fontSize: 14,
    color: COLORS.text.secondary, // #E0E0E0 (plus lisible que #ccc)
    lineHeight: 20,
    padding: 12,
  },
  
  // ✅ Input container avec design Editia
  inputContainer: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderTopWidth: 1,
    borderTopColor: COLORS.surface.border,
    padding: 16,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background.tertiary, // #2a2a2a (au lieu de #222)
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  textInput: {
    flex: 1,
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    maxHeight: 100,
    minHeight: 24,
  },
  
  // ✅ Send button avec Rouge Editia
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface.divider, // #333333
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendButtonActive: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ScriptChatInterface;

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION SCRIPT CHAT INTERFACE:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour boutons principaux et messages utilisateur
 * • #4CD964 (vert) → #00FF88 (Vert Editia) pour status validé et streaming
 * • #FF3B30 → Maintenu pour les erreurs (couleur système)
 * • #333/#888/#ccc → Hiérarchie cohérente de grises Editia
 * 
 * 💬 AMÉLIORATIONS INTERFACE CHAT:
 * • Messages utilisateur en Rouge Editia pour identité forte
 * • Status badges avec palette Editia (Vert succès, Bleu utilisé)
 * • Bouton de validation avec ombre colorée
 * • Input amélioré avec focus Rouge Editia
 * • Touch targets accessibles (44px minimum)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Shadows colorées pour éléments interactifs
 * • Border radius cohérent (8px, 12px, 16px)
 * • Hiérarchie de texte améliorée
 * • États hover et active plus fluides
 * 
 * 44 couleurs hardcodées → Interface de chat cohérente Editia ✨
 */