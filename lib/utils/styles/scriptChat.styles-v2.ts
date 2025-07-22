/**
 * 🎨 Script Chat Styles v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 1:
 * ❌ Avant: 38 couleurs hardcodées pour interface de chat
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const scriptChatStyles = StyleSheet.create({
  // ✅ Container principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  centeredText: {
    color: COLORS.text.disabled, // #808080 (plus lisible que #888)
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // ✅ Gestion d'erreurs cohérente
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Error background système
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)', // Error border système
    marginBottom: 16,
    gap: 8,
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  
  errorDismiss: {
    padding: 4,
    borderRadius: 4,
  },
  
  errorDismissText: {
    color: COLORS.status.error,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // ✅ Container des messages
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 16,
  },
  
  // ✅ Messages avec nouvelle palette
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
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // ✅ Bulles utilisateur avec Rouge Editia
  userBubble: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderBottomRightRadius: 4,
    shadowColor: COLORS.shadow.primary,
  },
  
  assistantBubble: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
  },
  
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text.primary,
  },
  
  userText: {
    color: COLORS.text.primary,
  },
  
  assistantText: {
    color: COLORS.text.primary,
  },
  
  // ✅ Indicateur de streaming avec Rouge Editia
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  
  streamingText: {
    fontSize: 12,
    color: COLORS.interactive.primary, // #FF0050
    fontStyle: 'italic',
  },
  
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  
  timestamp: {
    fontSize: 11,
    color: COLORS.text.quaternary, // #909090
  },
  
  checkmark: {
    marginLeft: 4,
  },
  
  // ✅ Preview de script
  scriptPreview: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  scriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.interactive.primary, // #FF0050
  },
  
  scriptActionsButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginRight: 4,
    minWidth: 32,
    minHeight: 32,
  },
  
  // ✅ Bouton générer avec Rouge Editia
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.interactive.primary, // #FF0050
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minHeight: 32,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  generateButtonText: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  
  scriptContent: {
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: 8,
  },
  
  scriptMeta: {
    fontSize: 12,
    color: COLORS.text.tertiary, // #B0B0B0
    fontStyle: 'italic',
  },
  
  // ✅ Indicateur de frappe avec Rouge Editia
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.interactive.primary, // #FF0050
  },
  
  dot1: {
    opacity: 0.4,
  },
  
  dot2: {
    opacity: 0.7,
  },
  
  dot3: {
    opacity: 1,
  },
  
  typingText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  
  // ✅ Input et suggestions
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
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    minHeight: 44, // Touch target accessible
  },
  
  suggestionCardActive: {
    borderColor: COLORS.surface.borderActive, // #FF0050
    backgroundColor: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
  },
  
  suggestionTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  suggestionSubtitle: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  
  // ✅ Interface d'input améliorée
  inputWrapper: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
  },
  
  inputWrapperFocused: {
    borderColor: COLORS.surface.borderActive, // #FF0050
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.text.primary,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  
  // ✅ Bouton d'envoi avec Rouge Editia
  sendButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  sendButtonDisabled: {
    backgroundColor: COLORS.surface.divider, // #333333
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // ✅ Actions de script
  scriptActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  primaryActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.interactive.primaryBorder, // rgba(255, 0, 80, 0.3)
  },
  
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  actionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  // ✅ Container de script collapsible
  collapsibleScriptContainer: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a (au lieu de #181818)
    borderRadius: 12, // Plus moderne que 10
    margin: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    overflow: 'hidden',
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12, // Légèrement plus généreux
    minHeight: 44, // Touch target
  },
  
  collapsibleHeaderActive: {
    backgroundColor: COLORS.interactive.primaryBackground,
  },
  
  collapsibleTitle: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  
  collapsibleContent: {
    paddingHorizontal: 14,
    paddingBottom: 12, // Plus généreux
  },
  
  collapsibleScriptText: {
    color: COLORS.text.primary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  
  collapsibleMeta: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  // ✅ NOUVEAUX: États de succès et premium
  successBubble: {
    backgroundColor: COLORS.status.success, // #00FF88
    borderBottomRightRadius: 4,
  },
  
  successText: {
    color: '#000000', // Texte noir sur fond vert pour contraste
  },
  
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.interactive.premium, // #FFD700
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minHeight: 32,
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  premiumButtonText: {
    color: '#000000', // Texte noir sur fond or
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // ✅ NOUVEAUX: États de chargement améliorés
  loadingBubble: {
    backgroundColor: COLORS.background.secondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    opacity: 0.8,
  },
  
  pulsatingDot: {
    backgroundColor: COLORS.interactive.primary,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  
  // ✅ NOUVEAUX: Messages système
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  
  systemBubble: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)', // Background or léger
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.brand.goldOverlay,
  },
  
  systemText: {
    color: COLORS.brand.gold, // #FFD700
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION SCRIPT CHAT:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour boutons principaux et bulles utilisateur
 * • #ff5555 (rouge) → #FF3B30 (Rouge système) pour les erreurs
 * • #888 (gris) → Hiérarchie cohérente (#B0B0B0, #808080, #909090)
 * • Ajout de l'or #FFD700 pour les fonctionnalités premium
 * 
 * 💬 AMÉLIORATIONS CHAT:
 * • Bulles utilisateur en Rouge Editia pour identité forte
 * • Indicateurs de frappe avec couleurs de marque
 * • États focus améliorés pour l'input
 * • Touch targets minimum 44px
 * • Shadows colorées pour profondeur
 * • Messages système avec fond or
 * 
 * 🚀 NOUVEAUTÉS:
 * • Bulles de succès avec vert #00FF88
 * • Boutons premium avec l'or Editia
 * • États de chargement avec Rouge Editia
 * • Suggestions cards interactives
 * • Headers collapsibles améliorés
 * 
 * 38 couleurs hardcodées → Interface de chat cohérente Editia ✨
 */