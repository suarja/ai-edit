import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, MessageCircle, CheckCircle2, Clock } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  streaming?: boolean;
}

/**
 * 🎯 DÉMO DU SCRIPT CHAT AVEC FEEDBACK TEMPS RÉEL
 * 
 * Cette démo illustre l'importance du feedback temps réel dans l'interface chat :
 * 1. Indicateur de frappe en temps réel
 * 2. Messages streaming character par character
 * 3. États visuels clairs (envoi, réception, terminé)
 * 4. Interface responsive et moderne
 */
export default function ScriptChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour ! Je suis ici pour vous aider à créer un script parfait. Décrivez-moi le type de vidéo que vous souhaitez créer.",
      timestamp: new Date().toISOString(),
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Simuler une réponse streaming
  const simulateStreamingResponse = async (userMessage: string) => {
    setIsStreaming(true);
    
    // Ajouter le message utilisateur
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 800));

    // Créer le message assistant avec streaming
    const assistantId = (Date.now() + 1).toString();
    setStreamingMessageId(assistantId);
    
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    
    setMessages(prev => [...prev, assistantMsg]);

    // Simuler différentes réponses selon le contenu
    let responseText = '';
    if (userMessage.toLowerCase().includes('café')) {
      responseText = "Excellent ! Voici un script de 30 secondes sur les bienfaits du café :\n\n[OUVERTURE - 3 secondes]\n\"Saviez-vous que votre tasse de café matinale est bien plus qu'un simple réveil ?\"\n\n[DÉVELOPPEMENT - 20 secondes]\n\"Le café est riche en antioxydants qui protègent vos cellules. Il améliore la concentration, booste votre métabolisme et peut même réduire le risque de certaines maladies. Une tasse contient plus d'antioxydants que la plupart des fruits !\"\n\n[CONCLUSION - 7 secondes]\n\"Alors la prochaine fois que vous dégustez votre café, rappelez-vous : vous ne buvez pas juste une boisson, vous consommez un véritable élixir de santé !\"\n\nQue pensez-vous de ce script ? Souhaitez-vous que je l'adapte ?";
    } else if (userMessage.toLowerCase().includes('productivité')) {
      responseText = "Parfait ! Créons un script percutant sur la productivité :\n\n[ACCROCHE - 3 secondes]\n\"3 habitudes qui vont transformer votre productivité dès aujourd'hui.\"\n\n[CONTENU - 22 secondes]\n\"Première habitude : La règle des 2 minutes. Si une tâche prend moins de 2 minutes, faites-la immédiatement. Deuxième habitude : Planifiez votre journée la veille. Votre cerveau travaillera déjà sur vos objectifs pendant la nuit. Troisième habitude : Éliminez les distractions. Un téléphone en mode silencieux peut augmenter votre focus de 40%.\"\n\n[APPEL À L'ACTION - 5 secondes]\n\"Choisissez une de ces habitudes et testez-la dès demain. Votre futur vous remerciera !\"\n\nCe script vous convient-il ?";
    } else {
      responseText = `Merci pour cette idée ! Je vais créer un script personnalisé pour "${userMessage}".\n\nPour vous proposer le meilleur contenu possible, pouvez-vous me préciser :\n\n• Quelle est la durée souhaitée ?\n• Quel est votre public cible ?\n• Quel ton souhaitez-vous adopter (professionnel, décontracté, inspirant) ?\n• Y a-t-il des points spécifiques à aborder ?\n\nCes informations m'aideront à créer un script parfaitement adapté à vos besoins !`;
    }

    // Streaming character par character
    for (let i = 0; i <= responseText.length; i++) {
      const partialText = responseText.substring(0, i);
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { ...msg, content: partialText }
          : msg
      ));
      
      // Délai variable pour simuler la vitesse de frappe naturelle
      const delay = Math.random() * 30 + 10; // 10-40ms
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Marquer comme terminé
    setMessages(prev => prev.map(msg => 
      msg.id === assistantId 
        ? { ...msg, streaming: false }
        : msg
    ));
    
    setStreamingMessageId(null);
    setIsStreaming(false);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isStreaming) return;
    
    await simulateStreamingResponse(currentMessage.trim());
  };

  const renderMessage = (message: ChatMessage) => {
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
          {message.streaming && (
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MessageCircle size={24} color="#007AFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Script Chat</Text>
            <Text style={styles.headerSubtitle}>
              {isStreaming ? 'IA en train d\'écrire...' : 'Créez votre script parfait'}
            </Text>
          </View>
        </View>
        
        {isStreaming && (
          <View style={styles.statusIndicator}>
            <Clock size={16} color="#FF9500" />
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {/* Indicateur de frappe global */}
        {isStreaming && streamingMessageId && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.typingText}>L'IA génère votre script...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="Décrivez votre idée de vidéo..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
          editable={!isStreaming}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!currentMessage.trim() || isStreaming) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!currentMessage.trim() || isStreaming}
        >
          {isStreaming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Info footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Cette démo illustre le feedback temps réel essentiel pour l'UX
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
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
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  checkmark: {
    marginLeft: 4,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streamingText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
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
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 