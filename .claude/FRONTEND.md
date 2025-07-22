# 🎨 Editia Mobile - Guide Frontend

L'application mobile Editia utilise React Native avec Expo et TypeScript. Le design system est inspiré de la **magnifique palette de couleurs de l'onboarding** pour créer une expérience visuelle cohérente et alignée avec l'identité de marque.

## 🎨 Design System v2.0 (Nouveau!)

### Palette Editia - Inspirée de l'Onboarding
- **Rouge Editia**: `#FF0050` - Notre couleur signature
- **Or Premium**: `#FFD700` - Fonctionnalités Pro et célébrations  
- **Vert Succès**: `#00FF88` - États de réussite
- **Bleu Accent**: `#007AFF` - Actions secondaires
- **Orange Célébration**: `#FF6B35` - Confettis et animations

### Références Design System
- **Design System v2**: `.claude/design-system-v2.json` - Tokens avec palette Editia
- **Couleurs Centralisées**: `lib/constants/colors.ts` - Système de couleurs unifié
- **Hook de Thème**: `lib/hooks/useTheme.ts` - Accès centralisé aux styles
- **Guide Migration**: `.claude/STYLE-MIGRATION-GUIDE.md` - Plan de migration détaillé

## Current Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Styling**: StyleSheet (migrating to Tailwind)
- **Icons**: Lucide React Native
- **Navigation**: Expo Router
- **State**: React hooks + local state
- **UI Philosophy**: Conversational, AI-aware interfaces

### Component Hierarchy
```
app/
├── (drawer)/              # Main app screens
├── (onboarding)/          # User onboarding flow  
├── (auth)/                # Authentication screens
└── components/            # Reusable UI components
```

## Design System Usage

### Colors (Always use design system tokens)
```typescript
// ✅ Good - Use design system colors
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000', // colors.background.primary
  },
  card: {
    backgroundColor: '#1a1a1a', // colors.background.secondary  
  },
  text: {
    color: '#ffffff', // colors.text.primary
  },
  accent: {
    color: '#007AFF', // colors.interactive.primary
  }
});

// ❌ Bad - Hardcoded colors
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  }
});
```

### Typography (Follow hierarchy)
```typescript
// ✅ Good - Semantic typography
const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 20,     // typography.scales.title.fontSize
    fontWeight: '600', // typography.scales.title.fontWeight
    color: '#ffffff',
  },
  sectionLabel: {
    fontSize: 16,     // typography.scales.headline.fontSize  
    fontWeight: '600',
    color: '#ffffff',
  },
  bodyText: {
    fontSize: 15,     // typography.scales.body.fontSize
    lineHeight: 22,   // typography.scales.body.lineHeight
    color: '#cccccc',
  }
});
```

### Spacing (Use consistent scale)
```typescript
// ✅ Good - Design system spacing
const styles = StyleSheet.create({
  screen: {
    padding: 20,      // spacing.semantic.screenPadding
  },
  card: {
    padding: 16,      // spacing.semantic.cardPadding
    marginBottom: 24, // spacing.semantic.sectionGap
  },
  section: {
    gap: 16,          // spacing.semantic.componentGap
  }
});
```

## UI Patterns

### 1. Conversational Cards
```tsx
// ✅ Excellent example from script-video-settings.tsx
<TouchableOpacity
  style={styles.scriptPreview}
  onPress={() => setIsScriptExpanded(!isScriptExpanded)}
  activeOpacity={0.8}
>
  <View style={styles.scriptPreviewHeader}>
    <Text style={styles.scriptPreviewTitle}>📝 Script à Générer</Text>
    {isScriptExpanded ? (
      <ChevronUp size={20} color="#007AFF" />
    ) : (
      <ChevronDown size={20} color="#007AFF" />
    )}
  </View>
  {/* Expandable content */}
</TouchableOpacity>
```

### 2. Smart Toggles with Context
```tsx
// ✅ Great pattern from VideoSettingsSection.tsx
<View style={styles.toggleContent}>
  <View>
    <Text style={styles.sectionTitle}>Sous-titres</Text>
    <Text style={styles.sectionDescription}>
      {currentConfig.enabled
        ? 'Personnalisez le style de vos sous-titres'
        : 'Activez les sous-titres pour votre vidéo'}
    </Text>
  </View>
  <Switch
    value={currentConfig.enabled}
    onValueChange={handleToggleChange}
    trackColor={{ false: '#333', true: '#007AFF' }}
    thumbColor={currentConfig.enabled ? '#fff' : '#888'}
  />
</View>
```

### 3. Live Preview Components
```tsx
// ✅ Excellent pattern - show immediate feedback
<View style={styles.previewBox}>
  {renderEffectPreview()} {/* Updates in real-time */}
</View>
```

### 4. Horizontal Scrolling Options
```tsx
// ✅ Perfect for mobile - thumb-friendly selection
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.presetsContainer}
>
  {presets.map((preset) => (
    <PresetCard key={preset.id} preset={preset} />
  ))}
</ScrollView>
```

### 5. Alert States with Context
```tsx
// ✅ Contextual alerts with proper styling
{requirementsWarnings.length > 0 && (
  <View style={styles.requirementsContainer}>
    {requirementsWarnings.map((warning, index) => (
      <View key={index} style={styles.conditionsWarning}>
        <Text style={styles.conditionsWarningText}>{warning}</Text>
      </View>
    ))}
  </View>
)}
```

## Component Standards

### File Organization
```
components/
├── ComponentName.tsx           # Main component
├── ComponentName.styles.ts     # Styles (if complex)
├── ComponentName.test.tsx      # Tests
└── README.md                   # Documentation
```

### Component Structure
```tsx
// ✅ Standard component structure
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ComponentProps } from '@/lib/types';

interface ComponentNameProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onPress,
  disabled = false
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ComponentName;
```

## AI-Aware Patterns

### 1. Loading States for AI Operations
```tsx
// ✅ Engaging AI loading states
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color="#007AFF" />
  <Text style={styles.loadingText}>Génération en cours...</Text>
  <Text style={styles.loadingStep}>Analyse de votre script...</Text>
</View>
```

### 2. AI-Powered Suggestions
```tsx
// ✅ Show AI confidence and allow overrides
<View style={styles.suggestionCard}>
  <Text style={styles.suggestionLabel}>Suggestion IA</Text>
  <Text style={styles.suggestionText}>{aiSuggestion}</Text>
  <View style={styles.confidenceIndicator}>
    <Text style={styles.confidenceText}>Confiance: 87%</Text>
  </View>
</View>
```

### 3. Progressive AI Disclosure
```tsx
// ✅ Show AI reasoning when helpful
{showAIReasoning && (
  <View style={styles.aiReasoning}>
    <Text style={styles.aiReasoningTitle}>Pourquoi cette suggestion?</Text>
    <Text style={styles.aiReasoningText}>{reasoning}</Text>
  </View>
)}
```

## Accessibility Standards

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Comfortable Spacing**: 8px between interactive elements
- **Visual Feedback**: Always provide visual feedback on touch

### Color Contrast
- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Clear focus states
- **Error States**: Use color + text/icons, not just color

### Screen Reader Support
```tsx
// ✅ Accessibility props
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Générer une vidéo"
  accessibilityHint="Commence la génération de votre vidéo"
>
```

## Performance Guidelines

### Optimization Patterns
- **FlatList**: For long lists instead of ScrollView
- **Memoization**: Use React.memo for expensive re-renders
- **Image Optimization**: Proper image sizing and caching
- **State Management**: Avoid unnecessary re-renders

### Loading Strategies
```tsx
// ✅ Optimistic updates for better perceived performance
const handleToggle = (value: boolean) => {
  // Update UI immediately
  setLocalState(value);
  
  // Then sync with backend
  syncWithBackend(value).catch(() => {
    // Revert on error
    setLocalState(!value);
  });
};
```

## Testing Guidelines

### Component Testing
```tsx
// ✅ Test user interactions and visual states
import { render, fireEvent } from '@testing-library/react-native';

test('should expand when tapped', () => {
  const { getByTestId } = render(<ExpandableCard />);
  const card = getByTestId('expandable-card');
  
  fireEvent.press(card);
  
  expect(getByTestId('expanded-content')).toBeTruthy();
});
```

### Visual Testing
- Test in dark mode (primary)
- Test with different text sizes
- Test touch targets on various screen sizes
- Test loading and error states

## Migration Path (StyleSheet → Tailwind)

### Phase 1: Current (StyleSheet)
- Use design system tokens in StyleSheet
- Create utility functions for common patterns
- Document component patterns

### Phase 2: Tailwind Integration
- Install NativeWind or similar
- Create custom Tailwind config with design tokens
- Migrate components incrementally

### Phase 3: AI-Enhanced Styling
- Use AI to suggest optimal style combinations
- Create intelligent design token system
- Implement responsive design with AI insights

## Common Patterns Reference

### Best Components to Reference
1. **script-video-settings.tsx** - Screen layout, loading states, alerts
2. **VideoSettingsSection.tsx** - Complex interactions, live previews
3. **SubmitButton.tsx** - Button states and interactions
4. **ConfigurationCards.tsx** - Card layouts and navigation

### Style Guidelines Checklist
- [ ] Uses design system colors
- [ ] Follows typography hierarchy
- [ ] Implements proper spacing
- [ ] Has accessible touch targets
- [ ] Provides visual feedback
- [ ] Handles loading/error states
- [ ] Works in dark mode
- [ ] Follows naming conventions

## Quick Commands for Claude

When working on frontend tasks:
1. **Always reference** `.claude/design-system.json`
2. **Check existing components** for similar patterns
3. **Test in dark mode** (primary theme)
4. **Implement loading states** for any AI operations
5. **Use conversational UI patterns** over traditional forms