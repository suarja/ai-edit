import { StyleSheet } from 'react-native';

export 
const accountChatStyles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    marginBottom: 20,
    gap: 12,
  },
  welcomeText: {
    color: '#fff',
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
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.3)',
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff5555',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  errorDismissText: {
    color: '#ff5555',
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
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
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
    color: '#fff',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  typingText: {
    color: '#888',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333',
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
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44, // Ensure minHeight for alignment
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

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    color: '#fff',
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
    color: '#007AFF',
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
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {},
});

export const markdownStyles = StyleSheet.create({
  body: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 6,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bullet_list_icon: {
    color: '#007AFF',
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    fontWeight: 'bold',
  },
  ordered_list_icon: {
    color: '#007AFF',
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
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});