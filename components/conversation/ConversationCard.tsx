import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Clock,
  User,
  Bot,
} from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

interface ConversationCardProps {
  conversation: {
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
  };
  onPress: () => void;
}

export default function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `il y a ${hours}h`;
    } else if (diffInHours < 7 * 24) {
      const days = Math.floor(diffInHours / 24);
      return `il y a ${days}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getConversationTitle = () => {
    if (conversation.title) return conversation.title;
    if (conversation.context?.tiktok_handle) {
      return `Chat @${conversation.context.tiktok_handle}`;
    }
    return 'Chat TikTok';
  };

  const getLastMessagePreview = () => {
    if (!conversation.last_message) return 'Nouvelle conversation';

    const { content, role } = conversation.last_message;
    const maxLength = 80;
    const preview = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    return preview;
  };

  const isNewConversation = !conversation.last_message;
  const lastMessageRole = conversation.last_message?.role;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Icon Section */}
        <View style={[
          styles.iconContainer,
          conversation.context?.tiktok_handle && styles.iconContainerWithHandle
        ]}>
          {conversation.context?.tiktok_handle ? (
            <TrendingUp size={24} color={SHARED_STYLE_COLORS.primary} />
          ) : (
            <MessageCircle size={24} color={SHARED_STYLE_COLORS.primary} />
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Title and Time Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {getConversationTitle()}
            </Text>
            <View style={styles.timeContainer}>
              <Clock size={12} color={SHARED_STYLE_COLORS.textMuted} />
              <Text style={styles.time}>
                {formatDate(conversation.updated_at)}
              </Text>
            </View>
          </View>

          {/* Last Message Preview */}
          <View style={styles.messagePreviewRow}>
            {lastMessageRole && (
              <View style={styles.roleIndicator}>
                {lastMessageRole === 'user' ? (
                  <User size={14} color={SHARED_STYLE_COLORS.textMuted} />
                ) : (
                  <Bot size={14} color={SHARED_STYLE_COLORS.primary} />
                )}
              </View>
            )}
            <Text 
              style={[
                styles.messagePreview,
                isNewConversation && styles.messagePreviewNew
              ]} 
              numberOfLines={2}
            >
              {getLastMessagePreview()}
            </Text>
          </View>

          {/* Footer Row */}
          <View style={styles.footerRow}>
            {conversation.context?.tiktok_handle && (
              <View style={styles.handleBadge}>
                <Text style={styles.handleText}>
                  @{conversation.context.tiktok_handle}
                </Text>
              </View>
            )}
            <Text style={styles.messageCount}>
              {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <ChevronRight size={20} color={SHARED_STYLE_COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerWithHandle: {
    backgroundColor: SHARED_STYLE_COLORS.success,
  },
  contentSection: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  roleIndicator: {
    marginTop: 2,
  },
  messagePreview: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  messagePreviewNew: {
    fontStyle: 'italic',
    color: SHARED_STYLE_COLORS.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  handleBadge: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  handleText: {
    fontSize: 11,
    color: SHARED_STYLE_COLORS.primary,
    fontWeight: '600',
  },
  messageCount: {
    fontSize: 11,
    color: SHARED_STYLE_COLORS.textMuted,
  },
});