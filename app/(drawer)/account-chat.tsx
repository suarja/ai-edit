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
import { useTikTokAnalysis } from '../../hooks/useTikTokAnalysis';

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
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // RevenueCat pour vérifier le statut PRO
  const { isPro, isReady, goPro } = useRevenueCat();
  
  // TikTok Analysis Hook
  const {
    startAnalysis,
    isAnalyzing,
    progress,
    analysisResult,
    status,
    error: analysisError,
    hasResult,
    clearError,
    reset
  } = useTikTokAnalysis();

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Surveiller les changements d'état de l'analyse
  useEffect(() => {
    if (hasResult && analysisResult) {
      // Ajouter un message de succès avec les résultats
      const successMessage = {
        id: `msg_${Date.now()}_success`,
        role: 'assistant',
        content: `✅ Analyse du compte @${tiktokHandle} terminée !\n\n📊 **Résultats:**\n• ${analysisResult.account_analysis.followers.toLocaleString()} abonnés\n• ${analysisResult.account_analysis.videos_count} vidéos\n• ${analysisResult.account_analysis.engagement_rate}% d'engagement\n\n💡 **Résumé:** ${analysisResult.insights.performance_summary}\n\nJe peux maintenant répondre à vos questions sur ce compte !`,
        timestamp: new Date().toISOString(),
        metadata: { isSystemMessage: true, isComplete: true },
      };
      
      setMessages(prev => [...prev, successMessage]);
    }
  }, [hasResult, analysisResult, tiktokHandle]);

  // Surveiller les erreurs d'analyse
  useEffect(() => {
    if (analysisError) {
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `❌ Erreur lors de l'analyse: ${analysisError}\n\nVeuillez réessayer avec un autre handle ou vérifier que le compte est public.`,
        timestamp: new Date().toISOString(),
        metadata: { isSystemMessage: true, isError: true },
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [analysisError]);

  // Vérification du statut PRO - utiliser goPro comme account-insights
  useEffect(() => {
    if (isReady && !isPro) {
      Alert.alert(
        'Fonctionnalité PRO',
        'L\'analyse de compte TikTok nécessite un abonnement PRO. Souhaitez-vous mettre à niveau ?',
        [
          { text: 'Plus tard', onPress: () => router.back() },
          { text: 'Voir les plans', onPress: () => goPro() },
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

    try {
      console.log('🎯 Starting TikTok analysis for:', tiktokHandle);
      
      // Démarrer l'analyse via notre API
      await startAnalysis(tiktokHandle);
      
      // Ajouter un message système de démarrage
      const startMessage = {
        id: `msg_${Date.now()}_start`,
        role: 'assistant',
        content: `🔍 Analyse du compte @${tiktokHandle} en cours...\n\nJe vais analyser les vidéos, les statistiques d'engagement et générer des insights personnalisés. Cela peut prendre quelques minutes.`,
        timestamp: new Date().toISOString(),
        metadata: { isSystemMessage: true, isProgress: true },
      };
      
      setMessages([startMessage]);
      setShowHandleInput(false);
      
    } catch (error) {
      console.error('❌ Error analyzing account:', error);
      Alert.alert('Erreur', `Impossible d'analyser ce compte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !hasResult) return;
    
    // Ajouter le message utilisateur
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    
    // Simulation de réponse IA basée sur l'analyse
    setTimeout(() => {
      let response = '';
      
      if (analysisResult) {
        // Générer une réponse contextuelle basée sur les données d'analyse
        if (currentMessage.toLowerCase().includes('engagement')) {
          response = `L'engagement de @${tiktokHandle} est de ${analysisResult.account_analysis.engagement_rate}%. ${analysisResult.insights.performance_summary}`;
        } else if (currentMessage.toLowerCase().includes('recommandation')) {
          response = `Voici mes recommandations pour @${tiktokHandle}:\n\n${analysisResult.insights.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}`;
        } else if (currentMessage.toLowerCase().includes('stratégie')) {
          response = `Stratégie de contenu pour @${tiktokHandle}:\n\n${analysisResult.insights.content_strategy}`;
        } else {
          response = `Concernant "${currentMessage}" pour le compte @${tiktokHandle}:\n\n${analysisResult.insights.performance_summary}\n\nPour plus de détails spécifiques, demandez-moi des informations sur l'engagement, les recommandations ou la stratégie de contenu !`;
        }
      } else {
        response = `Je n'ai pas encore d'analyse complète pour répondre à cette question. Veuillez d'abord analyser un compte TikTok.`;
      }
      
      const aiMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
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

  // Show paywall for non-pro users
  if (isReady && !isPro) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat avec votre Compte</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.paywallContainer}>
            <View style={styles.paywallHeader}>
              <Crown size={48} color="#FFD700" />
              <Text style={styles.paywallTitle}>Chat TikTok Pro</Text>
            </View>
            
            <Text style={styles.paywallDescription}>
              Analysez votre compte TikTok et discutez avec notre IA experte pour 
              obtenir des conseils personnalisés et optimiser votre stratégie de contenu.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Analyse complète de votre compte TikTok</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Chat intelligent avec votre expert IA</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Recommandations personnalisées en temps réel</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Stratégies d'engagement optimisées</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Analyse des tendances de votre niche</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={goPro}
            >
              <Crown size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Passer Pro</Text>
            </TouchableOpacity>
            
            <Text style={styles.paywallFooter}>
              Déverrouillez le chat TikTok avec votre abonnement Pro.
            </Text>
          </View>
        </ScrollView>
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
            {progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
            {status && (
              <Text style={styles.statusText}>
                Status: {status}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      {hasResult && !showHandleInput && (
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
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
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  // Paywall styles
  scrollView: {
    flex: 1,
  },
  paywallContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
}); 