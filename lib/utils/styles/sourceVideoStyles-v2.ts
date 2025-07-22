/**
 * 🎨 Source Video Styles v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 1:
 * ❌ Avant: 48 couleurs hardcodées incohérentes
 * ✅ Après: Palette unifiée Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const sourceVideoStyle = StyleSheet.create({
  // ✅ Container principal - Background cohérent
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  
  // ✅ Header avec nouvelle palette
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.divider, // #333333
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ✅ Typography avec hiérarchie cohérente
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary, // #FFFFFF
  },
  
  limitText: {
    fontSize: 14,
    color: COLORS.text.disabled, // #808080 (plus lisible que #888)
    marginTop: 4,
  },
  
  content: {
    flex: 1,
    padding: 20,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  
  // ✅ Plan info avec background cohérent
  planInfoContainer: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    padding: 12,
    borderRadius: 12, // Radius plus moderne
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  planInfoText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 14,
  },
  
  // ✅ États d'erreur avec couleurs système
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Error background cohérent
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)', // Error border
  },
  
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  
  errorTitle: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 16,
    fontWeight: '600',
  },
  
  errorText: {
    color: COLORS.status.error,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  
  errorButton: {
    backgroundColor: COLORS.status.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44, // Touch target accessible
  },
  
  supportButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.status.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44,
  },
  
  errorButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ Limite avec couleur premium or
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.08)', // Or background cohérent
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.brand.goldOverlay, // rgba(255, 215, 0, 0.2)
  },
  
  limitTextContainer: {
    flex: 1,
  },
  
  limitTitle: {
    color: COLORS.brand.gold, // #FFD700 (Or Editia!)
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  limitDescription: {
    color: COLORS.status.warning, // #FF9500 (cohérent avec le warning)
    fontSize: 14,
    lineHeight: 20,
  },
  
  // ✅ Section upload
  uploadSection: {
    gap: 20,
  },
  
  uploadDisabled: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  uploadDisabledText: {
    color: COLORS.text.disabled,
    fontSize: 16,
    fontWeight: '600',
  },
  
  uploadDisabledSubtext: {
    color: COLORS.text.muted, // #666666
    fontSize: 14,
    textAlign: 'center',
  },
  
  // ✅ Formulaires avec nouvelle palette
  form: {
    gap: 12,
  },
  
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    minHeight: 48, // Touch target accessible
  },
  
  textArea: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text.primary,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  // ✅ Boutons avec la palette Editia
  button: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    minHeight: 48,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  
  skipButton: {
    padding: 12,
    minHeight: 44,
  },
  
  skipButtonText: {
    color: COLORS.text.disabled,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // ✅ Sections et listes
  videosList: {
    marginTop: 32,
    gap: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  
  // ✅ États vides
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  emptyText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  emptySubtext: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // ✅ Éditeur de métadonnées
  metadataEditorContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  metadataTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  metadataInputContainer: {
    gap: 8,
  },
  
  metadataInputLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  metadataInput: {
    backgroundColor: COLORS.background.tertiary, // #2a2a2a
    borderRadius: 8,
    padding: 12,
    color: COLORS.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    minHeight: 44,
  },
  
  metadataTextArea: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text.primary,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  metadataActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  
  // ✅ Boutons secondaires cohérents
  cancelButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    minHeight: 44,
  },
  
  cancelButtonText: {
    color: COLORS.text.disabled,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // ✅ Bouton save avec Rouge Editia
  saveButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  saveButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ États d'erreur pour inputs
  inputError: {
    borderColor: COLORS.status.error,
    borderWidth: 2, // Plus visible
  },
  
  inputFocused: {
    borderColor: COLORS.surface.borderActive, // #FF0050 au focus
    borderWidth: 2,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  helperText: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  
  // ✅ Actions d'analyse
  analysisActions: {
    marginBottom: 16,
  },
  
  rejectButton: {
    backgroundColor: COLORS.status.error,
    padding: 12,
    borderRadius: 8,
    minHeight: 44,
  },
  
  rejectButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  analysisHelperText: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  
  // ✅ NOUVEAUX: États de succès avec palette Editia
  successContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)', // Success background
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  
  successText: {
    color: COLORS.status.success, // #00FF88
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ NOUVEAUX: Bouton premium avec Or
  premiumButton: {
    backgroundColor: COLORS.interactive.premium, // #FFD700
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    minHeight: 48,
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  premiumButtonText: {
    color: '#000000', // Texte noir sur fond or
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  
  // ✅ NOUVEAUX: Cards avec élévation
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardHighlighted: {
    borderColor: COLORS.surface.borderActive, // #FF0050
    shadowColor: COLORS.shadow.primary,
    shadowOpacity: 0.2,
  },
  
  // ✅ NOUVEAUX: Styles de modal cohérents
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.overlayStrong, // rgba(0, 0, 0, 0.8)
  },
  
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour les boutons principaux
 * • #ef4444 (rouge) → #FF3B30 (Rouge système) pour les erreurs
 * • #FFD700 (or) → Conservé et intégré comme couleur premium
 * • #888 (gris) → #808080 (Gris disabled cohérent)
 * 
 * 📱 AMÉLIORATIONS UX:
 * • Touch targets minimum 44px pour l'accessibilité
 * • Border radius cohérent (8px, 12px, 16px)
 * • États focus et disabled visuellement clairs
 * • Hiérarchie de texte cohérente (primary → secondary → tertiary)
 * • Shadows colorées pour les éléments interactifs
 * 
 * 🚀 NOUVEAUTÉS:
 * • Nouveaux boutons premium avec l'or Editia
 * • États de succès avec le vert #00FF88
 * • Cards avec élévation et highlights
 * • États focus améliorés
 * 
 * 48 couleurs hardcodées → Palette centralisée Editia ✨
 */