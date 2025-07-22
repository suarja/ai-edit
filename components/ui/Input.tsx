/**
 * 🎨 Input Component - Design System v2.0 avec Palette Editia
 * 
 * Composant input générique utilisant la palette Editia
 * Variants: default, error, success, premium
 * Types: text, textarea, search
 */

import React, { useState, forwardRef } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../lib/constants/colors';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  variant?: 'default' | 'error' | 'success' | 'premium';
  type?: 'text' | 'textarea' | 'search';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  required?: boolean;
  testID?: string;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  success,
  helper,
  variant = 'default',
  type = 'text',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  required = false,
  testID,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    // Type variants
    if (type === 'textarea') baseStyle.push(styles.textareaContainer);
    if (type === 'search') baseStyle.push(styles.searchContainer);
    
    // State variants
    if (isFocused) baseStyle.push(styles.containerFocused);
    if (error) baseStyle.push(styles.containerError);
    if (success) baseStyle.push(styles.containerSuccess);
    
    // Color variants
    switch (variant) {
      case 'premium':
        baseStyle.push(styles.containerPremium);
        if (isFocused) baseStyle.push(styles.containerPremiumFocused);
        break;
    }
    
    if (containerStyle) baseStyle.push(containerStyle);
    
    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (type === 'textarea') baseStyle.push(styles.textarea);
    if (leftIcon) baseStyle.push(styles.inputWithLeftIcon);
    if (rightIcon) baseStyle.push(styles.inputWithRightIcon);
    if (inputStyle) baseStyle.push(inputStyle);
    
    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label];
    
    if (error) baseStyle.push(styles.labelError);
    if (success) baseStyle.push(styles.labelSuccess);
    if (variant === 'premium') baseStyle.push(styles.labelPremium);
    
    return baseStyle;
  };

  const getHelperTextStyle = () => {
    const baseStyle = [styles.helperText];
    
    if (error) baseStyle.push(styles.helperError);
    if (success) baseStyle.push(styles.helperSuccess);
    
    return baseStyle;
  };

  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <Text style={getLabelStyle()}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderHelperText = () => {
    const text = error || success || helper;
    if (!text) return null;
    
    return (
      <Text style={getHelperTextStyle()}>
        {text}
      </Text>
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon) return null;
    
    if (onRightIconPress) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightIconPress}
          activeOpacity={0.8}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.iconContainer}>
        {rightIcon}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {renderLabel()}
      <View style={getContainerStyle()}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={COLORS.text.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={type === 'textarea'}
          textAlignVertical={type === 'textarea' ? 'top' : 'center'}
          testID={testID}
          {...textInputProps}
        />
        {renderRightIcon()}
      </View>
      {renderHelperText()}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  // ✅ Wrapper
  wrapper: {
    marginBottom: 16,
  },
  
  // ✅ Label styles
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary, // #CCCCCC
    marginBottom: 8,
    lineHeight: 18,
  },
  
  labelError: {
    color: COLORS.status.error, // #FF3B30
  },
  
  labelSuccess: {
    color: COLORS.status.success, // #00FF88
  },
  
  labelPremium: {
    color: COLORS.brand.gold, // #FFD700 (Or Editia!)
    fontWeight: '600',
  },
  
  required: {
    color: COLORS.status.error,
  },
  
  // ✅ Container styles
  container: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48, // Touch target accessible
    paddingHorizontal: 16,
  },
  
  textareaContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  
  searchContainer: {
    borderRadius: 25,
    backgroundColor: COLORS.background.tertiary, // #2a2a2a
  },
  
  // ✅ Focus states avec palette Editia
  containerFocused: {
    borderColor: COLORS.surface.borderActive, // #FF0050 (Rouge Editia!)
    borderWidth: 2,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  containerError: {
    borderColor: COLORS.status.error, // #FF3B30
    borderWidth: 2,
  },
  
  containerSuccess: {
    borderColor: COLORS.status.success, // #00FF88
    borderWidth: 2,
  },
  
  containerPremium: {
    borderColor: COLORS.brand.goldOverlay, // rgba(255, 215, 0, 0.2)
    backgroundColor: 'rgba(255, 215, 0, 0.05)', // Or background léger
  },
  
  containerPremiumFocused: {
    borderColor: COLORS.brand.gold, // #FFD700
    shadowColor: COLORS.shadow.premium,
  },
  
  // ✅ Input styles
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary, // #FFFFFF
    paddingVertical: 12,
    lineHeight: 22,
  },
  
  textarea: {
    textAlignVertical: 'top',
    minHeight: 76, // 100 - padding
  },
  
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  
  inputWithRightIcon: {
    paddingRight: 12,
  },
  
  // ✅ Icon styles
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  
  // ✅ Helper text
  helperText: {
    fontSize: 12,
    color: COLORS.text.tertiary, // #B0B0B0
    marginTop: 6,
    lineHeight: 16,
  },
  
  helperError: {
    color: COLORS.status.error, // #FF3B30
  },
  
  helperSuccess: {
    color: COLORS.status.success, // #00FF88
  },
});

export default Input;

/**
 * 🎨 EXEMPLES D'USAGE:
 * 
 * // Input basique
 * <Input
 *   label="Titre de la vidéo"
 *   placeholder="Entrez le titre..."
 *   value={title}
 *   onChangeText={setTitle}
 * />
 * 
 * // Input avec erreur
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Email invalide"
 *   required
 * />
 * 
 * // Textarea
 * <Input
 *   label="Description"
 *   type="textarea"
 *   placeholder="Décrivez votre vidéo..."
 *   value={description}
 *   onChangeText={setDescription}
 *   helper="Maximum 500 caractères"
 * />
 * 
 * // Input premium avec Or
 * <Input
 *   label="Script Pro"
 *   variant="premium"
 *   placeholder="Fonctionnalité premium..."
 *   value={premiumScript}
 *   onChangeText={setPremiumScript}
 * />
 * 
 * // Input de recherche avec icône
 * <Input
 *   type="search"
 *   placeholder="Rechercher..."
 *   leftIcon={<SearchIcon size={20} color="#808080" />}
 *   rightIcon={<ClearIcon size={16} color="#808080" />}
 *   onRightIconPress={clearSearch}
 * />
 */