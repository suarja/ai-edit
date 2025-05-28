# Voice Recording Screen

The Voice Recording Screen is a critical component in the AI Edit onboarding flow, responsible for capturing user voice samples for AI voice cloning.

## Component Overview

The `VoiceRecordingScreen` component is located at `app/(onboarding)/voice-recording.tsx` and handles:

- Audio recording permissions
- Voice sample capture
- Processing of recorded audio
- Error handling and recovery
- Transmission to backend services

## Implementation Details

### Key Dependencies

```typescript
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
```

### State Management

The component uses several state variables to track the recording process:

```typescript
const [isRecording, setIsRecording] = useState(false);
const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [processing, setProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [progress, setProgress] = useState<string>('');
const [recordingDuration, setRecordingDuration] = useState(0);
```

### Audio Recording

The component uses Expo's Audio API to handle recording:

1. Permission request
2. Audio mode configuration
3. Recording initialization
4. Duration tracking
5. Recording finalization

```typescript
const startRecording = async () => {
  try {
    setError(null);

    // Request permissions
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      setError(
        "Autorisation d'enregistrement refusée. Veuillez l'activer dans les paramètres."
      );
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (status) => console.log('Recording status:', status),
      100
    );

    setRecording(recording);
    setIsRecording(true);
    setRecordingDuration(0);
  } catch (err: any) {
    console.error('Failed to start recording', err);
    setError(
      "Échec de la démarrage de l'enregistrement. " + (err?.message || '')
    );
  }
};
```

### Audio Processing

Once recording is complete, the audio is processed:

1. Audio file validation
2. FormData preparation
3. Transmission to Supabase Edge Function
4. Progress updates
5. Step completion

```typescript
const processRecording = async (uri: string) => {
  try {
    setProcessing(true);
    setError(null);
    setProgress("Préparation de l'audio...");

    // Fetch user and prepare audio data
    // Send to Supabase Edge Function
    // Handle response
    // Mark step as completed and proceed
  } catch (err: any) {
    // Error handling
  } finally {
    setProcessing(false);
    setProgress('');
  }
};
```

### Skip Functionality

The component also allows users to skip the voice recording step:

```typescript
const handleSkip = async () => {
  try {
    setProcessing(true);
    setProgress('Préparation de votre profil...');

    // Save survey data
    // Create default editorial profile

    // Complete step and proceed
    markStepCompleted('voice-recording');
    nextStep();
  } catch (err) {
    console.error('Error during skip handling:', err);
  } finally {
    setProcessing(false);
    setProgress('');
  }
};
```

## UI Structure

The component UI consists of:

1. Progress bar showing position in onboarding flow
2. Header with title and subtitle
3. Instructions panel
4. Recording duration display (when recording)
5. Record/Stop button
6. Skip option

## Integration with OnboardingProvider

The component integrates with the `OnboardingProvider` context to:

- Access survey answers from previous steps
- Mark the current step as completed
- Navigate to the next step when processing is complete

```typescript
const { nextStep, previousStep, markStepCompleted, surveyAnswers } =
  useOnboarding();
```

## Error Handling

The component implements robust error handling for:

- Permission denials
- Recording failures
- File size limits
- Processing errors
- API response errors

Each error state provides appropriate user feedback and recovery options.

## Backend Integration

The component interacts with two key backend services:

1. **Supabase Database**: For storing survey responses and user profile data
2. **Process Onboarding Edge Function**: For audio processing, transcription, and profile generation

For detailed implementation of the backend services, see:

- [process-onboarding/index.ts](../../supabase/functions/process-onboarding/index.ts)
- [onboarding-data-flow.md](../../memory-bank/onboarding-data-flow.md)

## Related Components

- [EditorialProfileForm](./editorial-profile-form.md): Displays the generated profile for editing
- [ProgressBar](./progress-bar.md): Shows progress through the onboarding flow
- [ProcessingScreen](./processing-screen.md): Loading state for AI operations

## Example Usage

The component is automatically loaded via Expo Router when navigating to the `/voice-recording` route during onboarding.

## Memory Bank References

For in-depth implementation details, refer to these memory bank documents:

- [Onboarding Component Architecture](../../memory-bank/onboarding-component-architecture.md)
- [Onboarding Data Flow](../../memory-bank/onboarding-data-flow.md)
- [Onboarding Update Summary](../../memory-bank/onboarding-update-summary.md)
