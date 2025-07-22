/**
 * 🎨 Hook de Thème Centralisé pour Editia
 * 
 * Fournit un accès unifié aux couleurs et styles de l'application
 * Basé sur la palette de l'onboarding
 */

import { useMemo } from 'react';
import { COLORS, type ColorToken } from '../constants/colors';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface ThemeHook {
  colors: ColorToken;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  createButtonStyle: (variant: ButtonVariant) => object;
  createCardStyle: (variant: CardVariant) => object;
  createShadowStyle: (variant: ShadowVariant) => object;
  screenWidth: number;
}

// Spacing system (même que design-system.json)
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  
  // Spacing sémantique
  screenPadding: 20,
  cardPadding: 32,
  buttonPadding: 16,
  sectionGap: 24,
  componentGap: 16,
  elementGap: 12,
} as const;

// Typography scales
const TYPOGRAPHY = {
  hero: {
    fontSize: 60,
    fontWeight: 'bold' as const,
    lineHeight: 68,
  },
  display: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  headline: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  callout: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  micro: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

// Border radius
const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// Shadow presets
const SHADOWS = {
  brand: {
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premium: {
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  elevated: {
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  celebration: {
    shadowColor: COLORS.shadow.celebration,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
} as const;

// Types pour les variants
export type ButtonVariant = 'primary' | 'premium' | 'secondary' | 'ghost';
export type CardVariant = 'standard' | 'onboarding' | 'celebration' | 'elevated';
export type ShadowVariant = keyof typeof SHADOWS;

/**
 * Hook principal pour accéder au système de design
 */
export const useTheme = (): ThemeHook => {
  
  // Générateur de styles de boutons
  const createButtonStyle = useMemo(() => (variant: ButtonVariant) => {
    const baseStyle = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: COLORS.interactive.primary,
          borderRadius: BORDER_RADIUS.lg,
          paddingVertical: 18,
          paddingHorizontal: 28,
          minHeight: 56,
          ...SHADOWS.brand,
        };
        
      case 'premium':
        return {
          ...baseStyle,
          backgroundColor: COLORS.interactive.premium,
          borderRadius: BORDER_RADIUS.lg,
          paddingVertical: 18,
          paddingHorizontal: 28,
          minHeight: 56,
          ...SHADOWS.premium,
        };
        
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderRadius: BORDER_RADIUS.md,
          paddingVertical: 14,
          paddingHorizontal: 20,
          minHeight: 44,
        };
        
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingVertical: 8,
          paddingHorizontal: 12,
          minHeight: 32,
        };
        
      default:
        return baseStyle;
    }
  }, []);
  
  // Générateur de styles de cartes
  const createCardStyle = useMemo(() => (variant: CardVariant) => {
    const baseStyle = {
      backgroundColor: COLORS.background.secondary,
      borderWidth: 1,
      borderColor: COLORS.surface.border,
    };
    
    switch (variant) {
      case 'standard':
        return {
          ...baseStyle,
          borderRadius: BORDER_RADIUS.lg,
          padding: SPACING.xl,
        };
        
      case 'onboarding':
        return {
          ...baseStyle,
          borderRadius: BORDER_RADIUS.xl,
          padding: SPACING['3xl'],
          ...SHADOWS.elevated,
        };
        
      case 'celebration':
        return {
          ...baseStyle,
          borderRadius: BORDER_RADIUS.xl,
          padding: SPACING['4xl'],
          borderColor: COLORS.brand.redBorder,
          ...SHADOWS.celebration,
        };
        
      case 'elevated':
        return {
          ...baseStyle,
          borderRadius: BORDER_RADIUS.lg,
          padding: SPACING.xl,
          ...SHADOWS.elevated,
        };
        
      default:
        return baseStyle;
    }
  }, []);
  
  // Générateur de styles d'ombres
  const createShadowStyle = useMemo(() => (variant: ShadowVariant) => {
    return SHADOWS[variant];
  }, []);
  
  return {
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    createButtonStyle,
    createCardStyle,
    createShadowStyle,
    screenWidth,
  };
};

// Export des types pour TypeScript
export type { ColorToken };

// Export des constantes pour usage direct si besoin
export { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS };