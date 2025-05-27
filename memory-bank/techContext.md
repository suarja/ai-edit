# Technical Context: AI Edit

## Technology Stack

### Frontend
- **Framework**: React Native with Expo (v53.0.0)
- **Navigation**: Expo Router with typed routes
- **UI Components**: Custom components with Lucide React Native icons
- **State Management**: React hooks and context
- **Storage**: AsyncStorage for local data persistence

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage with public video bucket
- **Edge Functions**: Supabase Functions for serverless processing

### AI Services
- **Script Generation**: OpenAI GPT-4 for content creation
- **Voice Synthesis**: ElevenLabs for custom voice cloning
- **Video Rendering**: Creatomate for template-based video generation

### Development Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Code Formatting**: Prettier
- **Linting**: Expo lint

## Architecture Overview

### Mobile App Structure
```
app/
├── (auth)/           # Authentication flow
├── (onboarding)/     # User setup flow
├── (tabs)/           # Main app navigation
└── api/              # API route handlers
```

### Key Libraries
- `@supabase/supabase-js`: Database and auth client
- `openai`: GPT-4 integration
- `expo-av`: Video playback
- `expo-camera`: Video recording
- `expo-document-picker`: File uploads
- `react-native-reanimated`: Animations

## Database Schema

### Core Tables
- **users**: User profiles and authentication
- **editorial_profiles**: Content style and persona settings
- **voice_clones**: ElevenLabs voice configuration
- **videos**: Source video assets
- **scripts**: Generated and reviewed content
- **video_requests**: Render job tracking

### Storage
- **videos bucket**: Public storage for video assets with RLS policies

## API Architecture

### Client-Side API Routes
- `app/api/videos/generate+api.ts`: Video generation endpoint
- `app/api/videos/status/[id]+api.ts`: Status polling endpoint

### Supabase Edge Functions
- `create-voice-clone`: ElevenLabs voice setup
- `process-onboarding`: User initialization

## AI Agent System

### ScriptGenerator
- **Purpose**: Generate initial scripts from user prompts
- **Model**: GPT-4 with specialized prompts for TikTok content
- **Optimization**: 30-60 second duration, conversational tone
- **Output**: Raw script optimized for voice synthesis

### ScriptReviewer
- **Purpose**: Refine scripts for ElevenLabs TTS
- **Focus**: Prosody, punctuation, clarity
- **Constraints**: No ellipses, proper sentence structure
- **Output**: TTS-ready script

### CreatomateBuilder
- **Purpose**: Generate video template JSON
- **Integration**: Creatomate API for video rendering
- **Templates**: Professional vertical video layouts
- **Dynamic Content**: Script-driven text overlays

## Environment Configuration

### Required Environment Variables
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# AI Services
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
CREATOMATE_API_KEY=
CREATOMATE_TEMPLATE_ID=
```

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Start Expo development server
```

### Build Process
- **Web**: `expo export --platform web`
- **Mobile**: Expo build service for iOS/Android

## Performance Considerations

### Video Processing
- Asynchronous generation with status polling
- Real-time progress updates via Supabase realtime
- Error handling and retry mechanisms

### Mobile Optimization
- Lazy loading for video assets
- Efficient image handling with expo-image
- Background processing for uploads

## Security

### Authentication
- Supabase Auth with email/password
- Row Level Security (RLS) on all tables
- JWT-based session management

### File Storage
- Public read access for generated videos
- Authenticated upload permissions
- Automatic file cleanup policies

## Internationalization
- French language interface (primary)
- i18n structure in place for expansion
- Localized content in UI components
