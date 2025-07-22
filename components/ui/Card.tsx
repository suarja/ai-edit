/**
 * 🎨 Card Component - Design System v2.0 avec Palette Editia
 * 
 * Composant carte générique utilisant la palette Editia
 * Variants: default, highlighted, premium, success, interactive
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants/colors';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'highlighted' | 'premium' | 'success' | 'error' | 'interactive';
  onPress?: () => void;
  disabled?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'small' | 'medium' | 'large';
  shadow?: boolean;
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  onPress,
  disabled = false,
  padding = 'medium',
  radius = 'medium',
  shadow = true,
  testID,
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // Padding variants
    switch (padding) {
      case 'none':
        baseStyle.push(styles.paddingNone);
        break;
      case 'small':
        baseStyle.push(styles.paddingSmall);
        break;
      case 'medium':
        baseStyle.push(styles.paddingMedium);
        break;
      case 'large':
        baseStyle.push(styles.paddingLarge);
        break;
    }
    
    // Radius variants
    switch (radius) {
      case 'small':
        baseStyle.push(styles.radiusSmall);
        break;
      case 'medium':
        baseStyle.push(styles.radiusMedium);
        break;
      case 'large':
        baseStyle.push(styles.radiusLarge);
        break;
    }
    
    // Shadow
    if (shadow) baseStyle.push(styles.shadow);
    
    // Color variants
    switch (variant) {
      case 'default':
        baseStyle.push(styles.cardDefault);
        break;
      case 'highlighted':
        baseStyle.push(styles.cardHighlighted);
        break;
      case 'premium':
        baseStyle.push(styles.cardPremium);
        break;
      case 'success':
        baseStyle.push(styles.cardSuccess);
        break;
      case 'error':
        baseStyle.push(styles.cardError);
        break;
      case 'interactive':
        baseStyle.push(styles.cardInteractive);
        break;
    }
    
    // States
    if (disabled) baseStyle.push(styles.cardDisabled);
    if (onPress && !disabled) baseStyle.push(styles.cardPressable);
    
    return baseStyle;
  };

  const getTitleStyle = () => {
    const baseStyle = [styles.title];
    
    switch (variant) {
      case 'highlighted':
        baseStyle.push(styles.titleHighlighted);
        break;
      case 'premium':
        baseStyle.push(styles.titlePremium);
        break;
      case 'success':
        baseStyle.push(styles.titleSuccess);
        break;
      case 'error':
        baseStyle.push(styles.titleError);
        break;
    }
    
    return baseStyle;
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;
    
    return (
      <View style={styles.header}>
        {title && <Text style={getTitleStyle()}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    );
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={getCardStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.8 : 1}
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {renderHeader()}
      <View style={styles.content}>
        {children}
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  // ✅ Base card style
  card: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
  },
  
  // ✅ Padding variants
  paddingNone: {
    padding: 0,
  },
  
  paddingSmall: {
    padding: 12,
  },
  
  paddingMedium: {
    padding: 16,
  },
  
  paddingLarge: {
    padding: 20,
  },
  
  // ✅ Radius variants
  radiusSmall: {
    borderRadius: 8,
  },
  
  radiusMedium: {
    borderRadius: 12,
  },
  
  radiusLarge: {
    borderRadius: 16,
  },
  
  // ✅ Shadow
  shadow: {
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // ✅ Color variants avec palette Editia
  cardDefault: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.surface.border,
  },
  
  cardHighlighted: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.surface.borderActive, // #FF0050 (Rouge Editia!)
    borderWidth: 2,
    shadowColor: COLORS.shadow.primary,
    shadowOpacity: 0.2,
  },
  
  cardPremium: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)', // Or background
    borderColor: COLORS.brand.goldOverlay, // rgba(255, 215, 0, 0.2)
    borderWidth: 1,
  },
  
  cardSuccess: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)', // Vert background
    borderColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 1,
  },
  
  cardError: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Rouge système background
    borderColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
  },
  
  cardInteractive: {
    backgroundColor: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
    borderColor: COLORS.interactive.primaryBorder, // rgba(255, 0, 80, 0.3)
    borderWidth: 1,
  },
  
  // ✅ States
  cardDisabled: {
    opacity: 0.6,
  },
  
  cardPressable: {
    // Style pour les cartes cliquables
  },
  
  // ✅ Header styles
  header: {
    marginBottom: 12,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    lineHeight: 22,
    marginBottom: 4,
  },
  
  // ✅ Title colors par variant
  titleHighlighted: {
    color: COLORS.interactive.primary, // #FF0050
  },
  
  titlePremium: {
    color: COLORS.brand.gold, // #FFD700
    fontWeight: 'bold',
  },
  
  titleSuccess: {
    color: COLORS.status.success, // #00FF88
    fontWeight: '700',
  },
  
  titleError: {
    color: COLORS.status.error, // #FF3B30
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0
    lineHeight: 18,
  },
  
  // ✅ Content container
  content: {
    flex: 1,
  },
});

export default Card;

/**
 * 🎨 EXEMPLES D'USAGE:
 * 
 * // Carte basique
 * <Card title="Configuration">
 *   <Text>Contenu de la carte</Text>
 * </Card>
 * 
 * // Carte premium avec Or
 * <Card 
 *   title="Fonctionnalité Pro" 
 *   subtitle="Débloquez toutes les options"
 *   variant="premium"
 * >
 *   <Button title="Upgrade" variant="premium" />
 * </Card>
 * 
 * // Carte interactive (Rouge Editia)
 * <Card 
 *   title="Script généré" 
 *   variant="highlighted"
 *   onPress={onViewScript}
 * >
 *   <Text>Votre script est prêt!</Text>
 * </Card>
 * 
 * // Carte succès
 * <Card 
 *   title="Vidéo générée!" 
 *   variant="success"
 *   radius="large"
 * >
 *   <Text>Votre vidéo est disponible</Text>
 * </Card>
 */