# Architecture

This section provides an overview of the AI Edit system architecture, data flows, and integration points.

## System Architecture

AI Edit is built using a modern architecture that combines client and server components:

- **Frontend**: React Native (Expo) mobile application
- **Backend**: Supabase and Edge Functions
- **AI Services**: OpenAI GPT-4, ElevenLabs, and Creatomate

For a visual representation of the system architecture, refer to the [System Architecture Diagram](./system-architecture.md).

## Data Flow

The platform has several key data flows:

- [Onboarding Flow](./onboarding-flow.md) - User registration and setup
- [Video Generation Flow](./video-generation-flow.md) - From request to rendered video
- [Voice Cloning Flow](./voice-cloning-flow.md) - Creating personalized AI voices

For detailed data flow diagrams, see [onboarding-data-flow.md](../../memory-bank/onboarding-data-flow.md) in the memory bank.

## Component Architecture

AI Edit uses a component-based architecture for the frontend, with:

- Reusable UI components
- Context providers for state management
- Screen components for routing

For more details on component architecture, see [Component Architecture](../components/component-architecture.md) and [onboarding-component-architecture.md](../../memory-bank/onboarding-component-architecture.md) in the memory bank.

## Database Schema

The application uses Supabase (PostgreSQL) with the following key tables:

- `users`: Core user data
- `editorial_profiles`: Content style preferences
- `voice_clones`: ElevenLabs voice settings
- `onboarding_survey`: User preferences from onboarding
- `videos`: Source video assets
- `scripts`: Generated and reviewed scripts
- `video_requests`: Render job tracking

For complete database schema details, see [Database Schema](./database-schema.md).

## Integration Points

AI Edit integrates with several external services:

- **OpenAI**: For content generation using GPT-4
- **ElevenLabs**: For voice synthesis and cloning
- **Creatomate**: For video rendering
- **Supabase**: For authentication, database, and storage

For integration details, see [External Integrations](./external-integrations.md).
