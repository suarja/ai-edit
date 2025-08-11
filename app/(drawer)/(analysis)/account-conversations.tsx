import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { API_ENDPOINTS } from '@/lib/config/api';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { accountConversationsStyles } from '@/lib/utils/styles/accountConversations.styles';
import { StandardFeatureLock } from '@/components/guards/StandardFeatureLock';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import ConversationCard from '@/components/conversation/ConversationCard';

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
  const { currentPlan, presentPaywall } = useRevenueCat();
  const { 
    conversations, 
    isConversationsLoading, 
    loadConversations,
    setCurrentConversation 
  } = useAnalysisContext();
  
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // Use ref to prevent infinite loops
  const loadConversationsRef = useRef(loadConversations);
  loadConversationsRef.current = loadConversations;

  // Initial load - trigger once on mount
  useEffect(() => {
    let mounted = true;
    
    const initialLoad = async () => {
      if (!hasLoadedOnce) {
        console.log('🔄 AccountConversations: Triggering initial load');
        try {
          await loadConversationsRef.current();
        } catch (error) {
          console.error('❌ AccountConversations: Initial load failed:', error);
        } finally {
          if (mounted) {
            setHasLoadedOnce(true);
          }
        }
      }
    };
    
    initialLoad();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const handleRefresh = async () => {
    console.log('🔄 AccountConversations: Manual refresh triggered');
    setRefreshing(true);
    setError(null); // Clear any previous errors
    try {
      await loadConversations();
      console.log('✅ AccountConversations: Manual refresh completed');
    } catch (err) {
      console.error('❌ AccountConversations: Manual refresh failed:', err);
      setError('Failed to refresh conversations');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateNewConversation = () => {
    // Navigate to chat with new=true parameter to force new conversation
    router.push('/(drawer)/(analysis)/account-chat?new=true');
  };

  const handleOpenConversation = (conversation: Conversation) => {
    // Définir la conversation actuelle dans le contexte
    setCurrentConversation(conversation.id);
    // Naviguer vers le chat
    const title = conversation.title || (conversation.context?.tiktok_handle ? `Chat @${conversation.context.tiktok_handle}` : 'Chat TikTok');
    router.push(`/(drawer)/(analysis)/account-chat?conversationId=${conversation.id}&chatTitle=${encodeURIComponent(title)}`);
  };


  // Show paywall for non-pro users
  if (currentPlan === 'free') {
    return (
      <StandardFeatureLock
        featureIcon={<MessageCircle color={SHARED_STYLE_COLORS.primary} />}
        featureTitle="Conversations IA Premium"
        featureDescription="Accédez à vos conversations IA personnalisées et obtenez des conseils stratégiques pour votre compte TikTok."
        features={[
          {
            icon: <MessageCircle color={SHARED_STYLE_COLORS.primary} />,
            text: "Conversations illimitées avec l'IA",
          },
          {
            icon: <TrendingUp color={SHARED_STYLE_COLORS.success} />,
            text: "Conseils stratégiques personnalisés",
          },
          {
            icon: <Users color={SHARED_STYLE_COLORS.warning} />,
            text: "Analyse approfondie de votre contenu",
          },
        ]}
        requiredPlan="creator"
        showCloseButton={true}
      />
    );
  }

  // Debug logging
  console.log('🔍 AccountConversations render state:', {
    isConversationsLoading,
    hasLoadedOnce,
    conversationsLength: conversations.length,
    refreshing,
    currentPlan
  });

  // Show loading screen: 
  // 1. When actively loading conversations OR
  // 2. When we haven't loaded once and have no conversations
  if (isConversationsLoading || (!hasLoadedOnce && conversations.length === 0)) {
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
        {hasLoadedOnce && !isConversationsLoading && conversations.length === 0 && (
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
        <View style={accountConversationsStyles.conversationsList}>
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onPress={() => handleOpenConversation(conversation)}
            />
          ))}
        </View>
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
