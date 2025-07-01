import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Plus, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  Users,
  Crown,
  ChevronRight
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message?: {
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  };
  context?: {
    tiktok_handle?: string;
    analysis_id?: string;
  };
}

export default function AccountConversationsScreen() {
  const { getToken } = useAuth();
  const { isPro, goPro } = useRevenueCat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPro) {
      loadConversations();
    }
  }, [isPro]);

  const loadConversations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_CONVERSATIONS(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleCreateNewConversation = () => {
    // Navigate to chat without conversationId (new conversation)
    router.push({
      pathname: '/(drawer)/(analysis)/account-chat',
      params: {}, // Explicitly clear any previous params
    });
  };

  const handleOpenConversation = (conversation: Conversation) => {
    // Navigate to chat with conversationId (existing conversation)
    router.push({
      pathname: '/(drawer)/(analysis)/account-chat',
      params: { conversationId: conversation.id, conversationTitle: getConversationTitle(conversation) },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.context?.tiktok_handle) {
      return `Chat @${conversation.context.tiktok_handle}`;
    }
    return 'Chat TikTok';
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) return 'Nouvelle conversation';
    
    const { content, role } = conversation.last_message;
    const prefix = role === 'user' ? 'Vous: ' : 'IA: ';
    const preview = content.length > 60 ? content.substring(0, 60) + '...' : content;
    return prefix + preview;
  };

  // Show paywall for non-pro users
  if (!isPro) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.paywallContainer}>
            <View style={styles.paywallHeader}>
              <Crown size={48} color="#FFD700" />
              <Text style={styles.paywallTitle}>Chat TikTok Pro</Text>
            </View>
            
            <Text style={styles.paywallDescription}>
              Accédez à vos conversations avec l'IA experte TikTok. Obtenez des conseils 
              personnalisés et optimisez votre stratégie de contenu.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Conversations illimitées avec l'IA TikTok</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Conseils personnalisés basés sur vos analyses</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Historique complet de vos discussions</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Streaming en temps réel</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.upgradeButton} onPress={goPro}>
              <Crown size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Passer Pro</Text>
            </TouchableOpacity>
            
            <Text style={styles.paywallFooter}>
              Débloquez le chat TikTok avec votre abonnement Pro.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnalysisHeader 
        title="Conversations"
        onBack={() => router.push('/(drawer)/(analysis)/account-insights')}
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && conversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#666" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptyDescription}>
              Commencez votre première conversation avec l'expert IA TikTok
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateNewConversation}
            >
              <Plus size={20} color="#007AFF" />
              <Text style={styles.emptyButtonText}>Nouvelle conversation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conversations List */}
        {conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationCard}
            onPress={() => handleOpenConversation(conversation)}
          >
            <View style={styles.conversationHeader}>
              <View style={styles.conversationIcon}>
                {conversation.context?.tiktok_handle ? (
                  <TrendingUp size={20} color="#007AFF" />
                ) : (
                  <MessageCircle size={20} color="#007AFF" />
                )}
              </View>
              
              <View style={styles.conversationInfo}>
                <Text style={styles.conversationTitle} numberOfLines={1}>
                  {getConversationTitle(conversation)}
                </Text>
                <Text style={styles.conversationPreview} numberOfLines={2}>
                  {getLastMessagePreview(conversation)}
                </Text>
              </View>

              <View style={styles.conversationMeta}>
                <Text style={styles.conversationTime}>
                  {formatDate(conversation.updated_at)}
                </Text>
                <Text style={styles.messageCount}>
                  {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
                </Text>
                <ChevronRight size={16} color="#666" />
              </View>
            </View>

            {conversation.context?.tiktok_handle && (
              <View style={styles.contextBadge}>
                <Users size={12} color="#007AFF" />
                <Text style={styles.contextText}>@{conversation.context.tiktok_handle}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateNewConversation}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
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

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  newChatButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Conversation Cards
  conversationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  messageCount: {
    fontSize: 11,
    color: '#666',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  contextText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
}); 