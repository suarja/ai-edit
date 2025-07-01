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
  MessageSquare 
} from 'lucide-react-native';
import { ChatMessage, ScriptDraft } from '@/types/script';

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
    <KeyboardAvoidingView 
      style={styles.container}
    >
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
                <View style={[
                  styles.statusBadge,
                  scriptDraft?.status === 'validated' && styles.statusValidated,
                  scriptDraft?.status === 'used' && styles.statusUsed,
                ]}>
                  <Text style={[
                    styles.statusText,
                    scriptDraft?.status === 'validated' && styles.statusTextValidated,
                    scriptDraft?.status === 'used' && styles.statusTextUsed,
                  ]}>
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
            >
              <RotateCcw size={20} color="#007AFF" />
            </TouchableOpacity>
            
            {hasScript && (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onSaveAsDraft}
                  disabled={isLoading}
                >
                  <Save size={20} color="#007AFF" />
                </TouchableOpacity>
                
                {canValidate && (
                  <TouchableOpacity
                    style={[styles.headerButton, styles.validateButton]}
                    onPress={onValidateScript}
                    disabled={isLoading}
                  >
                    <CheckCircle2 size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorDismiss} onPress={onClearError}>
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
            <MessageSquare size={48} color="#666" />
            <Text style={styles.emptyStateTitle}>Créons votre script ensemble</Text>
            <Text style={styles.emptyStateDescription}>
              Décrivez votre idée de vidéo et je vous aiderai à créer un script engageant
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
            <Loader size={24} color="#007AFF" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
      </ScrollView>

      {/* Current script preview */}
      {hasScript && (
        <View style={styles.scriptPreview}>
          <View style={styles.scriptPreviewHeader}>
            <Text style={styles.scriptPreviewTitle}>Script actuel</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Copy size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scriptPreviewContent} nestedScrollEnabled>
            <Text style={styles.scriptText}>{currentScript}</Text>
          </ScrollView>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Tapez votre message..."
            placeholderTextColor="#888"
            multiline
            maxLength={500}
            editable={!isStreaming && !isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              canSend && styles.sendButtonActive,
            ]}
            onPress={handleSendMessage}
            disabled={!canSend}
          >
            {isStreaming ? (
              <Loader size={20} color={canSend ? "#fff" : "#888"} />
            ) : (
              <Send size={20} color={canSend ? "#fff" : "#888"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.metadata?.isStreaming;

  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userMessage : styles.assistantMessage,
      isLast && styles.lastMessage,
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.assistantMessageText,
      ]}>
        {message.content}
      </Text>
      
      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <Loader size={12} color="#007AFF" />
        </View>
      )}
      
      <Text style={[
        styles.messageTime,
        isUser ? styles.userMessageTime : styles.assistantMessageTime,
      ]}>
        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    color: '#fff',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataText: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusValidated: {
    backgroundColor: '#4CD964',
  },
  statusUsed: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  statusTextValidated: {
    color: '#fff',
  },
  statusTextUsed: {
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validateButton: {
    backgroundColor: '#4CD964',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    marginLeft: 12,
  },
  errorDismissText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#888',
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
    color: '#888',
    fontSize: 16,
  },
  messageBubble: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  lastMessage: {
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#fff',
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
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantMessageTime: {
    color: '#888',
  },
  scriptPreview: {
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    maxHeight: 120,
  },
  scriptPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scriptPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  copyButton: {
    padding: 4,
  },
  scriptPreviewContent: {
    maxHeight: 80,
  },
  scriptText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    padding: 12,
  },
  inputContainer: {
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 24,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
});

export default ScriptChatInterface; 