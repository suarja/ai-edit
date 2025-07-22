/**
 * 🎨 Shared Styles v2 - Migré vers la nouvelle palette Editia
 * 
 * AVANT: Couleurs incohérentes (#9ca3af, #10b981, #3b82f6, #f59e0b)
 * APRÈS: Palette unifiée basée sur l'onboarding (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

// ✅ NOUVEAU: Plus de couleurs hardcodées, utilisation du système centralisé
export const sharedStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000 (plus cohérent que #9ca3af)
  },
  
  sectionContainer: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a (déjà correct)
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background.overlay, // rgba(0, 0, 0, 0.4)
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },

  // Text - Nouvelle hiérarchie cohérente
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary, // #FFFFFF (plus lisible que #f9fafb)
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  
  bodyText: {
    fontSize: 16,
    color: COLORS.text.secondary, // #E0E0E0 (meilleur contraste)
  },
  
  secondaryText: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0 (hiérarchie claire)
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30 (cohérent avec le système)
    fontSize: 14,
    textAlign: 'center',
  },

  // Buttons - Nouvelle palette Editia
  primaryButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Padding plus généreux
    paddingHorizontal: 28,
    borderRadius: 16, // Border radius plus moderne
    gap: 8,
    minHeight: 56, // Touch target accessible
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  primaryButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold', // Plus bold pour plus d'impact
    lineHeight: 20,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    minHeight: 44,
  },
  
  secondaryButtonText: {
    color: COLORS.text.disabled, // #808080 (plus cohérent)
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Nouveau: Bouton Premium
  premiumButton: {
    backgroundColor: COLORS.interactive.premium, // #FFD700 (Or!)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
    minHeight: 56,
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
  
  disabledButton: {
    opacity: 0.6,
  },

  // Inputs
  input: {
    color: COLORS.text.primary,
    fontSize: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12, // Plus moderne
    padding: 16, // Plus de padding
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    minHeight: 48, // Touch target accessible
  },
  
  inputFocused: {
    borderColor: COLORS.surface.borderActive, // #FF0050 au focus
    shadowColor: COLORS.shadow.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  inputLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Misc
  separator: {
    height: 1,
    backgroundColor: COLORS.surface.divider, // #333333
    marginVertical: 16,
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.surface.border,
  },
  
  // Nouveaux: États et feedback
  successText: {
    color: COLORS.status.success, // #00FF88
    fontSize: 14,
    textAlign: 'center',
  },
  
  warningText: {
    color: COLORS.status.warning, // #FF9500
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Nouveaux: Cards avec la nouvelle palette
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
  
  // Nouveaux: Progress indicators
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progress.track,
  },
  
  progressDotActive: {
    backgroundColor: COLORS.progress.fill, // #FF0050
    width: 24,
    shadowColor: COLORS.progress.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  
  progressDotCompleted: {
    backgroundColor: COLORS.progress.completed, // rgba(255, 0, 80, 0.6)
  },
});

// ✅ Export des couleurs aussi pour compatibilité
export const SHARED_STYLE_COLORS = {
  // Mapping vers la nouvelle palette pour compatibilité
  background: COLORS.background.primary,
  backgroundSecondary: COLORS.background.secondary,
  primary: COLORS.interactive.primary, // #FF0050 au lieu de #10b981
  secondary: COLORS.interactive.secondary, // #007AFF au lieu de #3b82f6
  accent: COLORS.interactive.premium, // #FFD700 au lieu de #f59e0b
  success: COLORS.status.success, // #00FF88 au lieu de #10b981
  text: COLORS.text.primary,
  textSecondary: COLORS.text.tertiary,
  border: COLORS.surface.border,
  error: COLORS.status.error,
  warning: COLORS.status.warning,
};

/**
 * 🎨 RÉSUMÉ DES CHANGEMENTS:
 * 
 * COULEURS PRINCIPALES:
 * ❌ Avant: #10b981 (vert) → ✅ Après: #FF0050 (rouge Editia)
 * ❌ Avant: #3b82f6 (bleu) → ✅ Après: #007AFF (bleu système)
 * ❌ Avant: #f59e0b (ambre) → ✅ Après: #FFD700 (or premium)
 * ❌ Avant: #9ca3af (gris) → ✅ Après: #000000 (noir pur)
 * 
 * AMÉLIORATIONS:
 * • Hiérarchie de texte plus claire (#FFFFFF → #E0E0E0 → #B0B0B0)
 * • Boutons avec ombres colorées et touch targets accessibles
 * • Border radius plus moderne (16px au lieu de 8px)
 * • Nouveau bouton premium or
 * • États focus et disabled cohérents
 * • Progress indicators avec la palette Editia
 */