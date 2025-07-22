/**
 * 🎨 Editia Mobile - Système de Couleurs Centralisé
 * 
 * Basé sur la magnifique palette de l'onboarding
 * Toutes les couleurs de l'app doivent utiliser ces tokens
 */

// Couleurs de base de la marque Editia
export const BRAND_COLORS = {
  // Rouge Editia - Couleur principale
  red: '#FF0050',
  redLight: 'rgba(255, 0, 80, 0.6)',
  redOverlay: 'rgba(255, 0, 80, 0.12)',
  redBorder: 'rgba(255, 0, 80, 0.3)',
  
  // Or - Premium et célébrations  
  gold: '#FFD700',
  goldOverlay: 'rgba(255, 215, 0, 0.2)',
  
  // Vert - Success et états positifs
  success: '#00FF88',
  
  // Bleu - Actions secondaires
  accent: '#007AFF',
  
  // Orange - Célébrations et confettis
  celebration: '#FF6B35',
} as const;

// Palette de gris et backgrounds
export const NEUTRAL_COLORS = {
  // Backgrounds
  black: '#000000',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
  
  // Borders et surfaces
  borderLight: 'rgba(255, 255, 255, 0.2)',
  borderMedium: 'rgba(255, 255, 255, 0.1)',
  borderDark: 'rgba(255, 255, 255, 0.05)',
  divider: '#333333',
  
  // Overlays
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayMedium: 'rgba(0, 0, 0, 0.8)',
  overlayStrong: 'rgba(0, 0, 0, 0.95)',
} as const;

// Hiérarchie de couleurs de texte
export const TEXT_COLORS = {
  primary: '#FFFFFF',      // Titres, contenu principal
  secondary: '#E0E0E0',    // Descriptions, sous-titres
  tertiary: '#B0B0B0',     // Métadonnées, informations secondaires
  quaternary: '#909090',   // Texte très secondaire
  disabled: '#808080',     // États désactivés, boutons inactifs
  muted: '#666666',        // Texte très discret, placeholders
} as const;

// États système
export const STATUS_COLORS = {
  success: BRAND_COLORS.success,
  warning: '#FF9500',
  error: '#FF3B30',
  info: BRAND_COLORS.accent,
} as const;

// Système de couleurs sémantiques
export const COLORS = {
  // Couleurs de marque
  brand: BRAND_COLORS,
  
  // Backgrounds et surfaces
  background: {
    primary: NEUTRAL_COLORS.black,
    secondary: NEUTRAL_COLORS.darkGray,
    tertiary: NEUTRAL_COLORS.mediumGray,
    overlay: NEUTRAL_COLORS.overlayLight,
    overlayStrong: NEUTRAL_COLORS.overlayMedium,
    overlayMax: NEUTRAL_COLORS.overlayStrong,
  },
  
  // Texte
  text: TEXT_COLORS,
  
  // Surfaces et bordures
  surface: {
    elevated: NEUTRAL_COLORS.darkGray,
    border: NEUTRAL_COLORS.borderLight,
    borderActive: BRAND_COLORS.red,
    borderSecondary: NEUTRAL_COLORS.borderMedium,
    borderMuted: NEUTRAL_COLORS.borderDark,
    divider: NEUTRAL_COLORS.divider,
  },
  
  // Interactions
  interactive: {
    primary: BRAND_COLORS.red,
    primaryHover: BRAND_COLORS.redLight,
    primaryBackground: BRAND_COLORS.redOverlay,
    primaryBorder: BRAND_COLORS.redBorder,
    secondary: BRAND_COLORS.accent,
    secondaryHover: 'rgba(0, 122, 255, 0.8)',
    secondaryBackground: 'rgba(0, 122, 255, 0.1)',
    premium: BRAND_COLORS.gold,
    premiumHover: 'rgba(255, 215, 0, 0.8)',
    premiumBackground: BRAND_COLORS.goldOverlay,
  },
  
  // États
  status: STATUS_COLORS,
  
  // Progress et indicateurs
  progress: {
    track: 'rgba(255, 255, 255, 0.2)',
    fill: BRAND_COLORS.red,
    completed: BRAND_COLORS.redLight,
    shadow: BRAND_COLORS.red,
  },
  
  // Ombres
  shadow: {
    primary: BRAND_COLORS.red,
    premium: BRAND_COLORS.gold,
    neutral: '#000000',
    celebration: BRAND_COLORS.red,
  },
} as const;

// Type pour TypeScript
export type ColorToken = typeof COLORS;
export type BrandColor = keyof typeof BRAND_COLORS;
export type TextColor = keyof typeof TEXT_COLORS;
export type StatusColor = keyof typeof STATUS_COLORS;

// Helper pour vérifier si une couleur est valide
export const isValidColor = (color: string): boolean => {
  return /^(#[0-9A-Fa-f]{3,6}|rgba?\([^)]+\))$/.test(color);
};

// Export par défaut pour l'usage simple
export default COLORS;