# Editorial Profile Form

The `EditorialProfileForm` component provides a user interface for reviewing and customizing AI-generated editorial profiles. This component is a critical part of the onboarding process, allowing users to refine how their content will be styled.

## Component Overview

The `EditorialProfileForm` component is located at `components/EditorialProfileForm.tsx` and handles:

- Display of AI-generated editorial profile data
- Form interface for editing profile fields
- Validation and completion tracking
- Submission of edited profile data

## Implementation Details

### Props Interface

```typescript
type EditorialProfileFormProps = {
  profile: EditorialProfile;
  onSave: (profile: EditorialProfile) => void;
  onCancel: () => void;
  saving?: boolean;
};

type EditorialProfile = {
  id: string;
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};
```

### Field Configuration

The component uses a structured configuration for form fields:

```typescript
const FIELD_CONFIGS = [
  {
    key: 'persona_description' as keyof EditorialProfile,
    title: 'Description du Persona',
    icon: User,
    placeholder: "Ex: Créateur de contenu tech passionné par l'innovation...",
    description: 'Décrivez votre personnalité de créateur et votre expertise',
    maxLength: 500,
    numberOfLines: 4,
    tips: [
      "Mentionnez votre domaine d'expertise",
      'Décrivez votre approche unique',
      'Incluez vos valeurs principales',
    ],
  },
  // Additional fields...
];
```

### State Management

The component manages several state variables:

```typescript
const [formData, setFormData] = useState<EditorialProfile>(profile);
const [activeField, setActiveField] = useState<string | null>(null);
```

### Form Completion Tracking

The component includes a completion percentage indicator:

```typescript
const getCompletionPercentage = () => {
  const fields = FIELD_CONFIGS.map((config) => formData[config.key]);
  const filledFields = fields.filter(
    (field) => field && field.trim().length > 0
  ).length;
  return Math.round((filledFields / fields.length) * 100);
};
```

### Form Validation

Before saving, the component validates that all fields are completed:

```typescript
const handleSave = () => {
  const missingFields = FIELD_CONFIGS.filter(
    (config) =>
      !formData[config.key] || formData[config.key].trim().length === 0
  );

  if (missingFields.length > 0) {
    Alert.alert(
      'Profil incomplet',
      `Veuillez remplir tous les champs pour créer un profil complet. Champs manquants: ${missingFields
        .map((f) => f.title)
        .join(', ')}`,
      [
        { text: 'Continuer quand même', onPress: () => onSave(formData) },
        { text: 'Compléter', style: 'cancel' },
      ]
    );
    return;
  }

  onSave(formData);
};
```

## UI Structure

The component UI consists of:

1. Header with title and completion percentage
2. Form fields with:
   - Field title and description
   - Icon that changes color when completed
   - Text input with character counter
   - Contextual tips that appear when field is focused
3. Footer with cancel and save buttons

## Key Features

### Interactive Field Tips

When a user focuses on a field, contextual tips appear to help them complete it effectively:

```tsx
{
  isActive && (
    <View style={styles.tipsContainer}>
      <View style={styles.tipsHeader}>
        <Lightbulb size={14} color="#007AFF" />
        <Text style={styles.tipsTitle}>Conseils</Text>
      </View>
      {config.tips.map((tip, tipIndex) => (
        <Text key={tipIndex} style={styles.tipText}>
          • {tip}
        </Text>
      ))}
    </View>
  );
}
```

### Visual Feedback

The component provides visual feedback as users complete fields:

- Icons change color when fields are filled
- A progress bar shows overall completion percentage
- The progress bar turns green when all fields are completed

### Field Character Limits

Each field has a defined character limit with a counter display:

```tsx
<Text style={styles.charCount}>
  {value?.length || 0}/{config.maxLength}
</Text>
```

## Integration Points

The `EditorialProfileForm` component is typically used in:

1. The onboarding flow after AI profile generation
2. The settings section where users can update their profile

The component receives:

- An initial profile object (AI-generated or previously saved)
- Callback functions for save and cancel actions
- A boolean flag to indicate when a save operation is in progress

## Styling

The component uses React Native's StyleSheet for styling, with a dark mode design:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Additional styles...
});
```

## Memory Bank References

For more information on how this component fits into the overall architecture, refer to:

- [Onboarding Component Architecture](../../memory-bank/onboarding-component-architecture.md)
- [Onboarding Data Flow](../../memory-bank/onboarding-data-flow.md)

## Related Components

- [VoiceRecordingScreen](./voice-recording-screen.md): Precedes this component in the onboarding flow
- [OnboardingProvider](./onboarding-provider.md): Manages the overall onboarding state

## Example Usage

```tsx
<EditorialProfileForm
  profile={aiGeneratedProfile}
  onSave={handleProfileSave}
  onCancel={handleCancel}
  saving={isSaving}
/>
```

This component is part of the onboarding flow but can also be used independently for profile editing in the main application.
