import { StyleSheet } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';


export const accountConversationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
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
    color: SHARED_STYLE_COLORS.text,
    marginTop: 12,
  },
  paywallDescription: {
    color: SHARED_STYLE_COLORS.text,
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
    color: SHARED_STYLE_COLORS.success,
    marginRight: 12,
  },
  featureText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.accent,
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
    color: SHARED_STYLE_COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  paywallFooter: {
    color: SHARED_STYLE_COLORS.textMuted,
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
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 14,
    textAlign: 'center',
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
    color: SHARED_STYLE_COLORS.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Conversation Cards
  conversationCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
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
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textMuted,
    lineHeight: 20,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
  },
  messageCount: {
    fontSize: 11,
    color: SHARED_STYLE_COLORS.textMuted,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  contextText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.primary,
    fontWeight: '500',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: SHARED_STYLE_COLORS.primary,
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