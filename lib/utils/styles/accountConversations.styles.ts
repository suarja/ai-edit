import { StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants/colors';

// Design System v2 - Utilisation des nouvelles couleurs Editia
const DS_COLORS = {
  background: {
    primary: COLORS.background.primary, // #000000
    secondary: COLORS.background.secondary, // #1a1a1a
  },
  text: {
    primary: COLORS.text.primary, // #FFFFFF
    secondary: COLORS.text.secondary, // #E0E0E0
    tertiary: COLORS.text.tertiary, // #B0B0B0
  },
  interactive: {
    primary: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    primaryBackground: COLORS.interactive.primaryBackground,
    primaryBorder: COLORS.interactive.primaryBorder,
  },
  surface: {
    border: COLORS.surface.border,
  },
};


export const accountConversationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
    fontSize: 28, // Design System v2 - Display
    fontWeight: 'bold',
    color: DS_COLORS.text.primary,
    marginTop: 12,
  },
  paywallDescription: {
    color: DS_COLORS.text.secondary,
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24, // Design System v2
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
    color: '#00FF88', // Success green from Design System v2
    marginRight: 12,
  },
  featureText: {
    color: DS_COLORS.text.primary,
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700', // Premium gold from Design System v2
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Design System v2
    paddingHorizontal: 28,
    borderRadius: 16, // Design System v2
    gap: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
    minHeight: 56,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    color: '#000000', // Black text on gold background
    fontSize: 16,
    fontWeight: 'bold', // Design System v2
  },
  paywallFooter: {
    color: DS_COLORS.text.tertiary,
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
    color: DS_COLORS.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 16, // Design System v2
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30', // Error color
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
    fontSize: 24, // Design System v2 - Title
    fontWeight: 'bold',
    color: DS_COLORS.text.primary,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 24, // Design System v2
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.interactive.primaryBackground,
    borderWidth: 1,
    borderColor: DS_COLORS.interactive.primary,
    borderRadius: 16, // Design System v2
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
    minHeight: 48,
  },
  emptyButtonText: {
    color: DS_COLORS.interactive.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Conversations List
  conversationsList: {
    paddingBottom: 50, // Space for floating button
  },

  // Conversation Cards
  conversationCard: {
    backgroundColor: DS_COLORS.background.secondary,
    borderRadius: 16, // Design System v2 - Déjà correct
    padding: 20, // Design System v2 - Plus de padding
    borderWidth: 1,
    borderColor: DS_COLORS.surface.border,
    marginBottom: 16, // Plus d'espace entre les cards
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationIcon: {
    width: 44, // Légèrement plus grand
    height: 44,
    borderRadius: 12, // Design System v2
    backgroundColor: DS_COLORS.interactive.primaryBackground,
    borderWidth: 1,
    borderColor: DS_COLORS.interactive.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Plus d'espace
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 18, // Design System v2 - Headline
    fontWeight: '600',
    color: DS_COLORS.text.primary,
    marginBottom: 6, // Plus d'espace
    lineHeight: 24,
  },
  conversationPreview: {
    fontSize: 14,
    color: DS_COLORS.text.tertiary,
    lineHeight: 20,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: DS_COLORS.text.tertiary,
    fontWeight: '500',
  },
  messageCount: {
    fontSize: 11,
    color: DS_COLORS.text.tertiary,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.interactive.primaryBackground,
    borderRadius: 12, // Design System v2
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: DS_COLORS.interactive.primaryBorder,
  },
  contextText: {
    fontSize: 12,
    color: DS_COLORS.interactive.primary,
    fontWeight: '600', // Plus bold
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 32, // Design System v2 spacing
    right: 20,
    backgroundColor: DS_COLORS.interactive.primary, // Rouge Editia
    width: 56, // Touch target plus accessible
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: DS_COLORS.interactive.primary, // Ombre colorée
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
});