import { StyleSheet } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export 
const accountChatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centeredText: {
    color: SHARED_STYLE_COLORS.textMuted,
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
    marginBottom: 20,
    gap: 12,
  },
  welcomeText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  loadingMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  errorDismissText: {
    color: SHARED_STYLE_COLORS.error,
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
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: SHARED_STYLE_COLORS.text,
  },
  userText: {
    color: SHARED_STYLE_COLORS.text,
  },
  assistantText: {
    color: SHARED_STYLE_COLORS.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    color: SHARED_STYLE_COLORS.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  typingText: {
    color: SHARED_STYLE_COLORS.textMuted,
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  suggestionTitle: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
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
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44, // Ensure minHeight for alignment
  },
  sendButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sendButtonDisabled: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    color: SHARED_STYLE_COLORS.text,
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
    color: SHARED_STYLE_COLORS.primary,
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
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  upgradeButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },

  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresPreview: {
    gap: 12,
    marginVertical: 20,
  },
  messageTime: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
});

export const markdownStyles = StyleSheet.create({
  body: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bullet_list_icon: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    fontWeight: 'bold',
  },
  ordered_list_icon: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 16,
    lineHeight: 22,
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
    color: SHARED_STYLE_COLORS.primary,
    textDecorationLine: 'underline',
  },
});