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
    primaryBackground: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
    primaryBorder: COLORS.interactive.primaryBorder, // rgba(255, 0, 80, 0.3)
  },
  surface: {
    border: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
  },
  status: {
    error: COLORS.status.error, // #FF3B30
  }
};

export const accountChatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background.primary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centeredText: {
    color: DS_COLORS.text.tertiary,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Chat Styles (like working chat.tsx)
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.interactive.primaryBackground,
    padding: 16,
    borderRadius: 16, // Design System v2 - border radius plus moderne
    borderWidth: 1,
    borderColor: DS_COLORS.interactive.primaryBorder,
    marginBottom: 20,
    gap: 12,
  },
  welcomeText: {
    color: DS_COLORS.text.primary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  loadingMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    color: DS_COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)', // Error background
    padding: 12,
    borderRadius: 12, // Design System v2
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)', // Error border
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: DS_COLORS.status.error,
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  errorDismissText: {
    color: DS_COLORS.status.error,
    fontSize: 12,
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
    backgroundColor: DS_COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: DS_COLORS.background.secondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: DS_COLORS.surface.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: DS_COLORS.text.primary,
  },
  userText: {
    color: DS_COLORS.text.primary,
  },
  assistantText: {
    color: DS_COLORS.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    color: DS_COLORS.text.tertiary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  typingText: {
    color: DS_COLORS.text.tertiary,
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Input Styles (like working chat.tsx)
  inputContainer: {
    padding: 20,
    paddingTop: 10,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: DS_COLORS.background.secondary,
    borderRadius: 16, // Design System v2
    padding: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.surface.border,
  },
  suggestionTitle: {
    color: DS_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    color: DS_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    backgroundColor: DS_COLORS.background.secondary,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: DS_COLORS.surface.border,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    color: DS_COLORS.text.primary,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44, // Ensure minHeight for alignment
  },
  sendButton: {
    backgroundColor: DS_COLORS.interactive.primary, // #FF0050
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    shadowColor: DS_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: DS_COLORS.text.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    color: DS_COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: DS_COLORS.interactive.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 4,
  },
  featuresList: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: DS_COLORS.text.primary,
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: DS_COLORS.interactive.primary,
    paddingVertical: 18, // Design System v2
    paddingHorizontal: 32,
    borderRadius: 16, // Design System v2
    marginTop: 16,
    minHeight: 56,
    shadowColor: DS_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    color: DS_COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold', // Design System v2
  },

  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  lockTitle: {
    fontSize: 28, // Design System v2 - Display size
    fontWeight: 'bold',
    color: DS_COLORS.text.primary,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24, // Design System v2
  },
  featuresPreview: {
    gap: 12,
    marginVertical: 20,
  },
  messageTime: {
    fontSize: 12,
    color: DS_COLORS.text.tertiary,
    marginTop: 4,
    textAlign: 'right',
  },
});

export const markdownStyles = StyleSheet.create({
  body: {
    color: DS_COLORS.text.primary,
    fontSize: 16,
    lineHeight: 24, // Design System v2
  },
  heading1: {
    fontSize: 24, // Design System v2 title
    fontWeight: 'bold',
    color: DS_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: DS_COLORS.surface.border,
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 18, // Design System v2 headline
    fontWeight: '600',
    color: DS_COLORS.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bullet_list_icon: {
    color: DS_COLORS.interactive.primary, // Rouge Editia pour les bullets
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    fontWeight: 'bold',
  },
  ordered_list_icon: {
    color: DS_COLORS.interactive.primary, // Rouge Editia pour les numéros
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    fontWeight: 'bold',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: DS_COLORS.interactive.primary, // Rouge Editia pour les liens
    textDecorationLine: 'underline',
  },
});