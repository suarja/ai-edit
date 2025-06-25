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
  RefreshCw,
  ArrowLeft
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useRevenueCat } from '@/providers/RevenueCat';
import { useTikTokAnalysis } from '../../hooks/useTikTokAnalysis';
import { API_ENDPOINTS } from '@/lib/config/api';

/**
 * 🎯 SIMPLIFIED TIKTOK ANALYSIS CHAT
 * 
 * Multi-step progressive flow:
 * 1. Paywall (if not Pro)
 * 2. Handle Input & Validation
 * 3. Analysis Progress
 * 4. Chat Interface
 * 5. Error Handling
 */
export default function AccountChatScreen() {
  const { isSignedIn, getToken } = useAuth();
  const { goPro } = useRevenueCat();
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // TikTok Analysis Hook with all state management
  const {
    currentStep,
    isAnalyzing,
    progress,
    status,
    statusMessage,
    analysisResult,
    error,
    handleInput,
    handleError,
    isValidatingHandle,
    isHandleValid,
    existingAnalysis,
    hasExistingAnalysis,
    effectiveIsPro,
    DEV_OVERRIDE_PRO,
    // Actions
    startAnalysis,
    updateHandleInput,
    validateHandle,
    clearError,
    reset,
    retryFromError,
  } = useTikTokAnalysis();

  // Chat state management (simplified like other working chats)
  const [messages, setMessages] = useState<any[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Handle sending chat messages (using same logic as working chats)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSendingMessage) return;
    
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsSendingMessage(true);
    
    try {
      console.log('🚀 Starting chat request...');
      const token = await getToken();
      
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_CHAT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: currentMessage,
          streaming: true,
          run_id: existingAnalysis?.id,
          tiktok_handle: handleInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Create assistant message
      const assistantMessageId = `msg_${Date.now()}_assistant`;
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content_delta' && data.delta) {
                fullContent += data.delta;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              } else if (data.type === 'message_complete' && data.content) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: data.content }
                      : msg
                  )
                );
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsSendingMessage(false);
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

  // STEP 1: Paywall for non-Pro users
  if (currentStep === 'paywall') {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {DEV_OVERRIDE_PRO && (
          <View style={styles.devBadge}>
            <Text style={styles.devText}>DEV</Text>
          </View>
        )}
        
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

  // STEP 2: Handle Input & Validation
  if (currentStep === 'input' || currentStep === 'validating') {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {DEV_OVERRIDE_PRO && (
          <View style={styles.devBadge}>
            <Text style={styles.devText}>DEV</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <TrendingUp size={48} color="#007AFF" />
            <Text style={styles.inputTitle}>Analyser un compte TikTok</Text>
            <Text style={styles.inputSubtitle}>
              Entrez le handle d'un compte pour obtenir des insights détaillés et commencer à chatter avec l'IA
            </Text>
          </View>
          
          <View style={styles.inputForm}>
            <Text style={styles.inputLabel}>Handle TikTok</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.handleInput,
                  handleError && styles.handleInputError,
                  isValidatingHandle && styles.handleInputValidating
                ]}
                value={handleInput}
                onChangeText={updateHandleInput}
                placeholder="@username ou lien TikTok"
                placeholderTextColor="#888"
                editable={!isValidatingHandle}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  // Validate when user presses "Done" on keyboard
                  if (handleInput.trim()) {
                    validateHandle();
                  }
                }}
              />
              {isValidatingHandle && (
                <View style={styles.validatingIndicator}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
            </View>
            
            {handleError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff5555" />
                <Text style={styles.errorText}>{handleError}</Text>
              </View>
            )}
            
            {!handleError && !isValidatingHandle && isHandleValid && (
              <View style={styles.successContainer}>
                <CheckCircle2 size={16} color="#4CAF50" />
                <Text style={styles.successText}>Handle valide ✓</Text>
              </View>
            )}
            
            <Text style={styles.inputHint}>
              Validation automatique après 2 secondes ou en appuyant sur "Analyser"
            </Text>
            
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                (!handleInput.trim() || isValidatingHandle) && styles.analyzeButtonDisabled
              ]}
              onPress={async () => {
                // Validate first, then start analysis if valid
                const isValid = await validateHandle();
                if (isValid && !hasExistingAnalysis) {
                  startAnalysis();
                }
              }}
              disabled={!handleInput.trim() || isValidatingHandle}
            >
              {isValidatingHandle ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <BarChart3 size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyser</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // STEP 3: Analysis Progress
  if (currentStep === 'analyzing') {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {DEV_OVERRIDE_PRO && (
          <View style={styles.devBadge}>
            <Text style={styles.devText}>DEV</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.analysisContainer}>
          <View style={styles.analysisHeader}>
            <BarChart3 size={64} color="#007AFF" />
            <Text style={styles.analysisTitle}>Analyse de @{handleInput}</Text>
            <Text style={styles.analysisSubtitle}>
              Je collecte et analyse les données de votre compte TikTok...
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusMessage}>{statusMessage}</Text>
            <Text style={styles.statusDetails}>
              {status === 'scraping' && 'Collecte des vidéos et métadonnées...'}
              {status === 'analyzing' && 'Analyse IA des données collectées...'}
              {status === 'starting' && 'Initialisation de l\'analyse...'}
            </Text>
          </View>

          <View style={styles.analysisSteps}>
            <AnalysisStep 
              title="Collecte des données" 
              completed={progress > 30}
              current={status === 'scraping'}
            />
            <AnalysisStep 
              title="Analyse IA" 
              completed={progress > 70}
              current={status === 'analyzing'}
            />
            <AnalysisStep 
              title="Génération des insights" 
              completed={progress > 90}
              current={progress > 90}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // STEP 4: Chat Interface
  if (currentStep === 'chat') {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {DEV_OVERRIDE_PRO && (
          <View style={styles.devBadge}>
            <Text style={styles.devText}>DEV</Text>
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome message */}
          <View style={styles.welcomeMessage}>
            <CheckCircle2 size={24} color="#4CAF50" />
            <Text style={styles.welcomeText}>
              ✅ Analyse terminée ! Je connais maintenant votre compte TikTok et peux vous donner des conseils personnalisés.
            </Text>
          </View>

          {/* Messages */}
          {messages.map(renderMessage)}
          
          {/* Typing indicator */}
          {isSendingMessage && (
            <View style={styles.typingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.typingText}>L'IA réfléchit...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.chatInputContainer}>
          <View style={styles.chatInputWrapper}>
            <TextInput
              style={styles.chatTextInput}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Posez une question sur votre compte..."
              placeholderTextColor="#888"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isSendingMessage}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // STEP 5: Error Handling
  if (currentStep === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {DEV_OVERRIDE_PRO && (
          <View style={styles.devBadge}>
            <Text style={styles.devText}>DEV</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.errorPageContainer}>
          <AlertCircle size={64} color="#ff5555" />
          <Text style={styles.errorTitle}>Oops ! Quelque chose s'est mal passé</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryButton} onPress={retryFromError}>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback (should not happen)
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.centeredText}>Chargement...</Text>
      </View>
    </SafeAreaView>
  );

  // Helper function to render chat messages
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

function AnalysisStep({ title, completed, current }: { 
  title: string; 
  completed: boolean; 
  current: boolean; 
}) {
  return (
    <View style={styles.analysisStep}>
      <View style={[
        styles.stepIndicator,
        completed && styles.stepCompleted,
        current && styles.stepCurrent
      ]}>
        {completed ? (
          <CheckCircle2 size={16} color="#fff" />
        ) : (
          <View style={styles.stepDot} />
        )}
      </View>
      <Text style={[
        styles.stepText,
        completed && styles.stepTextCompleted,
        current && styles.stepTextCurrent
      ]}>
        {title}
      </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  devBadge: {
    backgroundColor: '#ff5555',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  devText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Paywall Styles
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

  // Input Styles
  inputContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '80%',
  },
  inputHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputForm: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  handleInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48, // Make room for validation indicator
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  handleInputError: {
    borderColor: '#ff5555',
  },
  handleInputValidating: {
    borderColor: '#007AFF',
  },
  validatingIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: -8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#ff5555',
    fontSize: 14,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#333',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Analysis Styles
  analysisContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '80%',
  },
  analysisHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  analysisSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusMessage: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusDetails: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  analysisSteps: {
    gap: 16,
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepCurrent: {
    backgroundColor: '#007AFF',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  stepText: {
    color: '#888',
    fontSize: 16,
  },
  stepTextCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  stepTextCurrent: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Chat Styles
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    marginBottom: 20,
    gap: 12,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
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
  chatInputContainer: {
    padding: 20,
    paddingTop: 10,
  },
  chatInputWrapper: {
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
  chatTextInput: {
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

  // Error Styles
  errorPageContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorActions: {
    gap: 16,
    alignSelf: 'stretch',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 16,
  },
  resetButtonText: {
    color: '#888',
    fontSize: 16,
  },
}); 