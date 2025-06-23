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
import { Send, MessageCircle, CheckCircle2, BarChart3, TrendingUp, Crown } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useRevenueCat } from '@/providers/RevenueCat';

/**
 * 🎯 ACCOUNT ANALYSIS CHAT - TikTok Account Intelligence
 * 
 * Cette page permet de :
 * 1. Analyser un compte TikTok via handle/URL
 * 2. Converser avec l'IA sur les insights du compte
 * 3. Obtenir des recommandations personnalisées
 * 4. Nécessite un abonnement PRO
 */
export default function AccountChatScreen() {
  const { isSignedIn } = useAuth();
  const { new: isNewChat } = useLocalSearchParams<{ new?: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [showHandleInput, setShowHandleInput] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // RevenueCat pour vérifier le statut PRO
  const { isPro, isReady } = useRevenueCat();

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Vérification du statut PRO
  useEffect(() => {
    if (isReady && !isPro) {
      Alert.alert(
        'Fonctionnalité PRO',
        'L\'analyse de compte TikTok nécessite un abonnement PRO. Souhaitez-vous mettre à niveau ?',
        [
          { text: 'Plus tard', onPress: () => router.back() },
          { text: 'Voir les plans', onPress: () => router.push('/subscription') },
        ]
      );
    }
  }, [isReady, isPro]);

  const handleAnalyzeAccount = async () => {
    if (!tiktokHandle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un handle TikTok valide');
      return;
    }

    if (!isPro) {
      Alert.alert(
        'Fonctionnalité PRO',
        'Cette fonctionnalité nécessite un abonnement PRO.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // TODO: Appeler l'API d'analyse TikTok
      console.log('Analyzing TikTok account:', tiktokHandle);
      
      // Simulation pour l'instant
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Ajouter un message système
      const systemMessage = {
        id: `msg_${Date.now()}_system`,
        role: 'assistant',
        content: `✅ Analyse du compte @${tiktokHandle} terminée ! Je peux maintenant répondre à vos questions sur ce compte. Que souhaitez-vous savoir ?`,
        timestamp: new Date().toISOString(),
        metadata: { isSystemMessage: true },
      };
      
      setMessages([systemMessage]);
      setShowHandleInput(false);
      setCurrentAnalysis({ handle: tiktokHandle, status: 'completed' });
      
    } catch (error) {
      console.error('Error analyzing account:', error);
      Alert.alert('Erreur', 'Impossible d\'analyser ce compte. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentAnalysis) return;
    
    // Ajouter le message utilisateur
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simulation de réponse IA
    setTimeout(() => {
      const aiMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: `Voici mon analyse concernant "${inputMessage.trim()}" pour le compte @${currentAnalysis.handle}:\n\nCette fonctionnalité sera bientôt connectée à notre système d'analyse TikTok complet !`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const renderMessage = (message: any) => {
    const isUser = message.role === 'user';
    const isSystem = message.metadata?.isSystemMessage;
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isSystem && styles.systemBubble
        ]}>
          {isSystem && (
            <View style={styles.systemIcon}>
              <BarChart3 size={16} color="#4CAF50" />
            </View>
          )}
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
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={styles.centeredText}>Connectez-vous pour analyser vos comptes TikTok</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.centeredText}>Vérification de votre abonnement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Analyse TikTok</Text>
        </View>
        {!isPro && (
          <View style={styles.proRequired}>
            <Crown size={16} color="#FFD700" />
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Handle Input Section */}
        {showHandleInput && (
          <View style={styles.handleInputSection}>
            <View style={styles.handleInputHeader}>
              <TrendingUp size={32} color="#007AFF" />
              <Text style={styles.handleInputTitle}>Analyser un compte TikTok</Text>
              <Text style={styles.handleInputSubtitle}>
                Entrez le handle d'un compte pour obtenir des insights détaillés
              </Text>
            </View>
            
            <View style={styles.handleInputContainer}>
              <Text style={styles.handleInputLabel}>Handle TikTok</Text>
              <TextInput
                style={styles.handleInput}
                value={tiktokHandle}
                onChangeText={setTiktokHandle}
                placeholder="@username ou lien TikTok"
                placeholderTextColor="#888"
                editable={!isAnalyzing && isPro}
              />
              
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  (!tiktokHandle.trim() || isAnalyzing || !isPro) && styles.analyzeButtonDisabled
                ]}
                onPress={handleAnalyzeAccount}
                disabled={!tiktokHandle.trim() || isAnalyzing || !isPro}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <BarChart3 size={20} color="#fff" />
                    <Text style={styles.analyzeButtonText}>
                      {!isPro ? 'PRO Requis' : 'Analyser'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Messages */}
        {messages.map(renderMessage)}
        
        {/* Loading indicator */}
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyse en cours...</Text>
            <Text style={styles.loadingSubtext}>
              Scraping et analyse du compte @{tiktokHandle}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      {currentAnalysis && !showHandleInput && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Posez une question sur ce compte..."
                placeholderTextColor="#888"
                multiline
                maxLength={500}
                editable={isPro}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputMessage.trim() || !isPro) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim() || !isPro}
              >
                <Send size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  proRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  proText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  handleInputSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  handleInputHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  handleInputTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  handleInputSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  handleInputContainer: {
    gap: 16,
  },
  handleInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  handleInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#333',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
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
  systemBubble: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  systemIcon: {
    marginBottom: 8,
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
  checkmark: {
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 20,
    paddingTop: 10,
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
}); 