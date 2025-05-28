# Components

This section documents the key components used in the AI Edit application.

## Core Components

- [OnboardingProvider](./onboarding-provider.md) - Manages onboarding flow state
- [EditorialProfileForm](./editorial-profile-form.md) - UI for profile customization
- [VoiceRecordingScreen](./voice-recording-screen.md) - Audio capture component
- [VideoRequestForm](./video-request-form.md) - Content generation interface
- [ScriptEditor](./script-editor.md) - AI-assisted script editing
- [SubscriptionManager](./subscription-manager.md) - Payment plan management

## Onboarding Components

The onboarding flow includes several specialized components:

- [ProgressBar](./progress-bar.md) - Visual indication of onboarding progress
- [ProcessingScreen](./processing-screen.md) - Loading state for AI operations
- [SurveyQuestion](./survey-question.md) - Reusable survey question component

For detailed implementation notes on the onboarding components, see [onboarding-component-architecture.md](../../memory-bank/onboarding-component-architecture.md) in the memory bank.

## Provider Components

Provider components manage state and context:

- [OnboardingProvider](./onboarding-provider.md) - Onboarding flow state
- [AuthProvider](./auth-provider.md) - Authentication state
- [ThemeProvider](./theme-provider.md) - Visual theming

## UI Components

Reusable UI elements:

- [Button](./button.md) - Primary, secondary, and tertiary buttons
- [Input](./input.md) - Text input fields
- [AudioPlayer](./audio-player.md) - Audio playback component
- [VideoPlayer](./video-player.md) - Video playback component

## Component Architecture

For information on component organization and best practices, see [Component Architecture](./component-architecture.md).

## Memory Bank References

For in-depth implementation details on specific components, refer to these memory bank documents:

- [Onboarding Component Architecture](../../memory-bank/onboarding-component-architecture.md)
- [Onboarding Data Flow](../../memory-bank/onboarding-data-flow.md)
- [Onboarding Survey DB Fix](../../memory-bank/onboarding-survey-db-fix.md)
