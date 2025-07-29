# 🎨 Guide de Migration des Styles Editia

## Vue d'ensemble

Ce guide détaille la migration des styles de l'application mobile Editia vers le nouveau design system inspiré des couleurs magnifiques de l'onboarding.

### 🎯 Objectifs
- Unifier la palette de couleurs avec l'identité visuelle de l'onboarding
- Centraliser la gestion des styles dans un système cohérent
- Améliorer la consistance visuelle à travers toute l'application
- Faciliter la maintenance future des styles

## 🎨 Nouvelle Palette de Couleurs

### Couleurs de Marque Editia
```typescript
const EDITIA_COLORS = {
  // Couleur principale - Rouge Editia
  red: '#FF0050',
  redLight: 'hsla(341, 100.00%, 50.00%, 0.60)',
  redOverlay: 'rgba(255, 0, 80, 0.12)',
  redBorder: 'rgba(255, 0, 80, 0.3)',
  
  // Premium - Or
  gold: '#FFD700',
  goldOverlay: 'rgba(255, 215, 0, 0.2)',
  
  // Success - Vert
  success: '#00FF88',
  
  // Accent - Bleu
  accent: '#007AFF',
  
  // Célébration - Orange
  celebration: '#FF6B35',
}
```

### Hiérarchie des Couleurs de Texte
```typescript
const TEXT_COLORS = {
  primary: '#FFFFFF',    // Texte principal
  secondary: '#E0E0E0',  // Descriptions, contenu secondaire  
  tertiary: '#B0B0B0',   // Métadonnées, informations tertiaires
  quaternary: '#909090', // Texte très secondaire
  disabled: '#808080',   // États désactivés
  muted: '#666666',      // Texte très discret
}
```

## 📁 Fichiers à Migrer

### Phase 1: Fichiers Centraux (Priorité Haute)
```
✅ /mobile/lib/constants/sharedStyles.ts - DÉBUT DE MIGRATION
❌ /mobile/lib/constants/colors.ts - À CRÉER
❌ /mobile/lib/constants/themes.ts - À CRÉER  
❌ /mobile/lib/constants/components.ts - À CRÉER
```

### Phase 2: Composants UI (Priorité Haute)
```
❌ /mobile/components/ui/Button.tsx - À CRÉER/MIGRER
❌ /mobile/components/ui/Card.tsx - À CRÉER/MIGRER
❌ /mobile/components/ui/Modal.tsx - À CRÉER/MIGRER
❌ /mobile/components/ui/Input.tsx - À CRÉER/MIGRER
❌ /mobile/components/ui/ProgressBar.tsx - À MIGRER
```

### Phase 3: Écrans Principaux (Priorité Moyenne)
```
🔄 /mobile/app/(drawer)/settings.tsx - EN COURS
❌ /mobile/app/(settings)/ - À MIGRER
❌ /mobile/app/(drawer)/ - À MIGRER
❌ /mobile/components/Paywall.tsx - À MIGRER
❌ /mobile/components/SubscriptionManager.tsx - À MIGRER
```

### Phase 4: Composants Spécialisés (Priorité Basse)
```
✅ /mobile/components/onboarding/ - DÉJÀ AVEC NOUVELLE PALETTE
❌ /mobile/components/video/ - À MIGRER
❌ /mobile/components/analysis/ - À MIGRER
❌ /mobile/components/voice/ - À MIGRER
```

## 🔧 Stratégie de Migration

### 1. Centralisation des Couleurs

#### Créer `/mobile/lib/constants/colors.ts`
```typescript
export const COLORS = {
  brand: {
    primary: '#FF0050',
    secondary: '#007AFF', 
    premium: '#FFD700',
    success: '#00FF88',
    celebration: '#FF6B35',
  },
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayStrong: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#B0B0B0',
    quaternary: '#909090',
    disabled: '#808080',
    muted: '#666666',
  },
  surface: {
    elevated: '#1a1a1a',
    border: 'rgba(255, 255, 255, 0.2)',
    borderActive: '#FF0050',
    divider: '#333333',
  },
} as const;
```

#### Créer `/mobile/lib/constants/components.ts`
```typescript
import { COLORS } from './colors';

export const COMPONENT_STYLES = {
  button: {
    primary: {
      backgroundColor: COLORS.brand.primary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 28,
      minHeight: 56,
    },
    premium: {
      backgroundColor: COLORS.brand.premium,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 28,
      minHeight: 56,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
  },
  card: {
    standard: {
      backgroundColor: COLORS.background.secondary,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: COLORS.surface.border,
    },
    onboarding: {
      backgroundColor: COLORS.background.secondary,
      borderRadius: 24,
      padding: 32,
      borderWidth: 1,
      borderColor: COLORS.surface.border,
    },
  },
} as const;
```

### 2. Hooks de Style Centralisés

#### Créer `/mobile/lib/hooks/useTheme.ts`
```typescript
import { COLORS } from '../constants/colors';
import { COMPONENT_STYLES } from '../constants/components';

export const useTheme = () => {
  return {
    colors: COLORS,
    components: COMPONENT_STYLES,
    // Fonction helper pour créer des styles cohérents
    createButtonStyle: (variant: 'primary' | 'premium' | 'secondary') => {
      return {
        ...COMPONENT_STYLES.button[variant],
        shadowColor: variant === 'primary' ? COLORS.brand.primary : 
                    variant === 'premium' ? COLORS.brand.premium : 'transparent',
        shadowOpacity: variant !== 'secondary' ? 0.3 : 0,
        shadowRadius: variant !== 'secondary' ? 8 : 0,
      };
    },
  };
};
```

### 3. Composants UI Génériques

#### Créer `/mobile/components/ui/Button.tsx`
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/hooks/useTheme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'premium' | 'secondary';
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  onPress,
  disabled = false,
}) => {
  const { createButtonStyle, colors } = useTheme();
  
  const buttonStyle = createButtonStyle(variant);
  const textColor = variant === 'premium' ? '#000000' : colors.text.primary;
  
  return (
    <TouchableOpacity
      style={[buttonStyle, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
```

## 📋 Plan de Migration par Étapes

### Étape 1: Infrastructure (Semaine 1)
- [ ] Créer `/mobile/lib/constants/colors.ts`
- [ ] Créer `/mobile/lib/constants/components.ts` 
- [ ] Créer `/mobile/lib/hooks/useTheme.ts`
- [ ] Migrer `/mobile/lib/constants/sharedStyles.ts`

### Étape 2: Composants UI de Base (Semaine 2)
- [ ] Créer `/mobile/components/ui/Button.tsx`
- [ ] Créer `/mobile/components/ui/Card.tsx`
- [ ] Créer `/mobile/components/ui/Modal.tsx`
- [ ] Créer `/mobile/components/ui/Input.tsx`

### Étape 3: Screens Principaux (Semaine 3-4)
- [ ] Migrer `/mobile/app/(drawer)/settings.tsx`
- [ ] Migrer `/mobile/app/(settings)/`
- [ ] Migrer `/mobile/components/Paywall.tsx`
- [ ] Migrer `/mobile/components/SubscriptionManager.tsx`

### Étape 4: Finitions (Semaine 5)
- [ ] Migrer composants spécialisés restants
- [ ] Tests visuels sur tous les écrans
- [ ] Optimisations et ajustements finaux

## 🔍 Avant/Après - Exemples de Migration

### Ancien Code (sharedStyles.ts)
```typescript
// ❌ Ancien
export const SHARED_STYLE_COLORS = {
  background: '#9ca3af',
  primary: '#10b981', 
  secondary: '#3b82f6',
  accent: '#f59e0b',
};
```

### Nouveau Code 
```typescript
// ✅ Nouveau
import { COLORS } from '@/lib/constants/colors';

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: COLORS.brand.primary, // #FF0050
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    minHeight: 56,
  },
});
```

### Migration d'un Composant
```typescript
// ❌ Avant
const MyComponent = () => (
  <TouchableOpacity style={{ backgroundColor: '#007AFF' }}>
    <Text style={{ color: '#fff' }}>Button</Text>
  </TouchableOpacity>
);

// ✅ Après  
const MyComponent = () => {
  const { colors, createButtonStyle } = useTheme();
  
  return (
    <TouchableOpacity style={createButtonStyle('primary')}>
      <Text style={{ color: colors.text.primary }}>Button</Text>
    </TouchableOpacity>
  );
};
```

## ✅ Checklist de Migration

### Pour chaque composant migré:
- [ ] Remplacer les couleurs hardcodées par les tokens du design system
- [ ] Utiliser les composants UI génériques quand possible
- [ ] Appliquer les nouvelles conventions de spacing et border-radius
- [ ] Tester l'affichage sur dark mode
- [ ] Vérifier l'accessibilité (contraste, touch targets)
- [ ] Documenter les changements majeurs

### Tests de Validation:
- [ ] Tous les écrans affichent correctement les nouvelles couleurs
- [ ] Les interactions (hover, active) fonctionnent correctement
- [ ] Cohérence visuelle entre tous les composants
- [ ] Performance: pas de regression de vitesse
- [ ] Accessibilité: contraste et lisibilité maintenus

## 🎉 Résultat Attendu

Après cette migration, l'application aura:
- **Cohérence Visuelle**: Tous les composants utilisent la palette Editia
- **Maintenabilité**: Changements centralisés et propagés automatiquement
- **Performance**: Styles optimisés et réutilisables
- **Évolutivité**: Système extensible pour futures fonctionnalités
- **Identité Forte**: Couleurs alignées avec la marque Editia

---

*Ce guide sera mis à jour au fur et à mesure de l'avancement de la migration.*