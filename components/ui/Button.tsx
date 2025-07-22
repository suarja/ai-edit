/**
 * 🎨 Button Component - Design System v2.0 avec Palette Editia
 * 
 * Composant bouton générique utilisant la palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 * Variants: primary (Rouge Editia), premium (Or), success (Vert), secondary (Bleu)
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../lib/constants/colors';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'premium' | 'success' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  testID,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size variants
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);
    
    // Color variants
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonPrimary);
        break;
      case 'premium':
        baseStyle.push(styles.buttonPremium);
        break;
      case 'success':
        baseStyle.push(styles.buttonSuccess);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.buttonGhost);
        break;
    }
    
    // States
    if (disabled || loading) baseStyle.push(styles.buttonDisabled);
    if (fullWidth) baseStyle.push(styles.buttonFullWidth);
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    // Size variants
    if (size === 'small') baseStyle.push(styles.textSmall);
    if (size === 'large') baseStyle.push(styles.textLarge);
    
    // Color variants
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.textPrimary);
        break;
      case 'premium':
        baseStyle.push(styles.textPremium);
        break;
      case 'success':
        baseStyle.push(styles.textSuccess);
        break;
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.textGhost);
        break;
    }
    
    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'premium' ? '#000000' : COLORS.text.primary}
          />
        </View>
      );
    }

    const textElement = <Text style={getTextStyle()}>{title}</Text>;
    
    if (!icon) return textElement;
    
    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && icon}
        {textElement}
        {iconPosition === 'right' && icon}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ✅ Base button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 48, // Touch target accessible
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  
  // ✅ Size variants
  buttonSmall: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  buttonLarge: {
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  
  buttonFullWidth: {
    width: '100%',
  },
  
  // ✅ Color variants avec palette Editia
  buttonPrimary: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonPremium: {
    backgroundColor: COLORS.interactive.premium, // #FFD700 (Or Editia!)
    shadowColor: COLORS.shadow.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  buttonSuccess: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
    shadowColor: COLORS.shadow.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.interactive.secondary, // #007AFF (Bleu Editia!)
    shadowColor: COLORS.shadow.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.interactive.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // ✅ Text styles
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  
  textSmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  textLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
  
  // ✅ Text colors par variant
  textPrimary: {
    color: COLORS.text.primary, // #FFFFFF
  },
  
  textPremium: {
    color: '#000000', // Texte noir sur fond or
    fontWeight: 'bold',
  },
  
  textSuccess: {
    color: '#000000', // Texte noir sur fond vert
    fontWeight: '700',
  },
  
  textSecondary: {
    color: COLORS.text.primary, // #FFFFFF
  },
  
  textOutline: {
    color: COLORS.interactive.primary, // #FF0050
  },
  
  textGhost: {
    color: COLORS.interactive.primary, // #FF0050
  },
  
  // ✅ Layout containers
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;

/**
 * 🎨 EXEMPLES D'USAGE:
 * 
 * // Bouton principal (Rouge Editia)
 * <Button title="Générer vidéo" onPress={onGenerate} />
 * 
 * // Bouton premium (Or)
 * <Button title="Devenir Pro" variant="premium" onPress={onUpgrade} />
 * 
 * // Bouton succès (Vert)
 * <Button title="Terminé!" variant="success" onPress={onComplete} />
 * 
 * // Avec icône et loading
 * <Button 
 *   title="Uploader" 
 *   icon={<Upload size={16} color="#FFFFFF" />}
 *   loading={isUploading}
 *   onPress={onUpload}
 * />
 * 
 * // Outline pour actions secondaires
 * <Button title="Annuler" variant="outline" onPress={onCancel} />
 */