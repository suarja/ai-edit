# AI Video Generation Platform

A powerful platform that combines AI-driven content generation with professional video production capabilities.

## Features

- 🎥 Automated video generation from text prompts
- 🗣️ Custom voice cloning with ElevenLabs
- 📝 AI-powered script generation and optimization
- 🎨 Editorial profile management
- 📊 Video request tracking and status monitoring

## Tech Stack

- Frontend: React Native (Expo) with Expo Router
- Backend: Supabase + Edge Functions
- AI Services:
  - OpenAI GPT-4 for content generation
  - ElevenLabs for voice synthesis
  - Creatomate for video rendering

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Creatomate Configuration
CREATOMATE_API_KEY=your_creatomate_api_key
CREATOMATE_TEMPLATE_ID=your_template_id
CREATOMATE_DOCS_URL=/docs/creatomate.json
```

## Project Structure

```
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication routes
│   ├── (onboarding)/      # Onboarding flow
│   ├── (tabs)/            # Main app tabs
│   └── api/               # API routes
├── components/            # Reusable components
├── docs/                  # Documentation files
├── lib/                   # Core libraries
│   ├── agents/           # AI agent implementations
│   └── supabase.ts       # Supabase client
└── supabase/             # Supabase configuration
    ├── functions/        # Edge Functions
    └── migrations/       # Database migrations
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Architecture

### Video Generation Flow

1. User submits video request with:
   - Text prompt
   - Selected source videos
   - Editorial profile preferences
   - Voice clone settings

2. Backend process:
   - Script generation with GPT-4
   - Script review and optimization
   - Creatomate JSON template generation
   - Video rendering with Creatomate

3. Status monitoring:
   - Real-time status updates
   - Automatic polling for render status
   - Final video delivery

### AI Agents

- **ScriptGenerator**: Creates initial script from user prompt
- **ScriptReviewer**: Optimizes script for TTS and style
- **CreatomateBuilder**: Generates video template JSON

## Database Schema

Key tables:
- `users`: Core user data
- `editorial_profiles`: Content style preferences
- `voice_clones`: ElevenLabs voice settings
- `videos`: Source video assets
- `scripts`: Generated and reviewed scripts
- `video_requests`: Render job tracking

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT