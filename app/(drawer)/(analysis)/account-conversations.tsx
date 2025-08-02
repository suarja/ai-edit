import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { accountConversationsStyles } from '@/lib/utils/styles/accountConversations.styles';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
  const { currentPlan, presentPaywall } = useRevenueCat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentPlan !== 'free') {
      loadConversations();
    }
  }, [currentPlan]);

  const loadConversations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_CONVERSATIONS(), {
        headers: { Authorization: `Bearer ${token}` },
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
      params: {
        conversationId: conversation.id,
        conversationTitle: getConversationTitle(conversation),
      },
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
    const preview =
      content.length > 60 ? content.substring(0, 60) + '...' : content;
    return prefix + preview;
  };

  // Show paywall for non-pro users
  if (currentPlan === 'free') {
    return (
      <FeatureLock requiredPlan="creator" onLockPress={presentPaywall}>
        <SafeAreaView
          style={accountConversationsStyles.container}
          edges={['top']}
        >
          <AnalysisHeader
            title={'Conversations'}
            onBack={() => router.back()}
          />
          <View style={accountConversationsStyles.loadingContainer}>
            <MessageCircle size={64} color={SHARED_STYLE_COLORS.primary} />
            <Text style={accountConversationsStyles.emptyTitle}>
              Conversations Pro
            </Text>
            <Text style={accountConversationsStyles.emptyDescription}>
              Accédez à vos conversations IA personnalisées et obtenez des
              conseils stratégiques pour votre compte TikTok.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: SHARED_STYLE_COLORS.primary,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                marginTop: 20,
                alignItems: 'center',
              }}
              onPress={presentPaywall}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Débloquer avec le Plan Pro
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </FeatureLock>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={accountConversationsStyles.container}
        edges={['top']}
      >
        <View style={accountConversationsStyles.loadingContainer}>
          <ActivityIndicator size="large" color={SHARED_STYLE_COLORS.primary} />
          <Text style={accountConversationsStyles.loadingText}>
            Chargement des conversations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={accountConversationsStyles.container} edges={['top']}>
      <AnalysisHeader title={'Conversations'} onBack={() => router.back()} />
      <ScrollView
        style={accountConversationsStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={SHARED_STYLE_COLORS.primary}
          />
        }
      >
        {error && (
          <View style={accountConversationsStyles.errorContainer}>
            <Text style={accountConversationsStyles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && conversations.length === 0 && (
          <View style={accountConversationsStyles.emptyState}>
            <MessageCircle size={64} color="#666" />
            <Text style={accountConversationsStyles.emptyTitle}>
              Aucune conversation
            </Text>
            <Text style={accountConversationsStyles.emptyDescription}>
              Commencez votre première conversation avec l&apos;expert IA TikTok
            </Text>
            <TouchableOpacity
              style={accountConversationsStyles.emptyButton}
              onPress={handleCreateNewConversation}
            >
              <Plus size={20} color={SHARED_STYLE_COLORS.primary} />
              <Text style={accountConversationsStyles.emptyButtonText}>
                Nouvelle conversation
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conversations List */}
        {conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={accountConversationsStyles.conversationCard}
            onPress={() => handleOpenConversation(conversation)}
          >
            <View style={accountConversationsStyles.conversationHeader}>
              <View style={accountConversationsStyles.conversationIcon}>
                {conversation.context?.tiktok_handle ? (
                  <TrendingUp size={20} color={SHARED_STYLE_COLORS.primary} />
                ) : (
                  <MessageCircle size={20} color={SHARED_STYLE_COLORS.primary} />
                )}
              </View>

              <View style={accountConversationsStyles.conversationInfo}>
                <Text
                  style={accountConversationsStyles.conversationTitle}
                  numberOfLines={1}
                >
                  {getConversationTitle(conversation)}
                </Text>
                <Text
                  style={accountConversationsStyles.conversationPreview}
                  numberOfLines={2}
                >
                  {getLastMessagePreview(conversation)}
                </Text>
              </View>

              <View style={accountConversationsStyles.conversationMeta}>
                <Text style={accountConversationsStyles.conversationTime}>
                  {formatDate(conversation.updated_at)}
                </Text>
                <Text style={accountConversationsStyles.messageCount}>
                  {conversation.message_count} message
                  {conversation.message_count !== 1 ? 's' : ''}
                </Text>
                <ChevronRight size={16} color="#666" />
              </View>
            </View>

            {conversation.context?.tiktok_handle && (
              <View style={accountConversationsStyles.contextBadge}>
                <Users size={12} color={SHARED_STYLE_COLORS.primary} />
                <Text style={accountConversationsStyles.contextText}>
                  @{conversation.context.tiktok_handle}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={accountConversationsStyles.floatingButton}
        onPress={handleCreateNewConversation}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
