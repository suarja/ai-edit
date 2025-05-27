# Active Context: AI Edit

## Current Project State
The AI Edit platform is in active development with core infrastructure and basic functionality implemented. The project has a solid foundation with authentication, onboarding, and the main app structure in place.

## Recent Development Focus
- **Core Architecture**: Established React Native/Expo app with Supabase backend
- **AI Integration**: Implemented GPT-4 script generation and ElevenLabs voice synthesis
- **Database Schema**: Set up user management, editorial profiles, and video tracking
- **File Storage**: Configured Supabase storage with proper RLS policies
- **Navigation Structure**: Implemented tab-based navigation with auth flow

## Current App Structure

### Implemented Screens
- **Landing Page**: French-language welcome screen with video generation preview
- **Authentication**: Sign-in and sign-up flows
- **Onboarding**: Welcome, editorial profile setup, voice clone creation
- **Main Tabs**:
  - Sources: Video upload and management
  - Créer: Video request creation
  - Générées: Generated video library
  - Paramètres: Settings and configuration

### Key Features Working
- **User Authentication**: Supabase auth with email/password
- **Editorial Profiles**: Persona, tone, audience, and style configuration
- **AI Script Generation**: GPT-4 powered content creation with review system
- **File Storage**: Video upload and storage with public access
- **Real-time Updates**: Status tracking for video generation

## Active Development Areas

### AI Agent System
- **ScriptGenerator**: Fully implemented with TikTok-optimized prompts
- **ScriptReviewer**: Implemented for ElevenLabs TTS optimization
- **CreatomateBuilder**: Needs implementation for video template generation

### Video Generation Pipeline
- **Status**: Partially implemented
- **Missing**: Complete Creatomate integration and video rendering
- **API Endpoints**: Basic structure in place, needs full implementation

### User Experience
- **Onboarding Flow**: Basic structure implemented
- **Main App Navigation**: Tab structure complete
- **Screen Implementations**: Most screens need full UI implementation

## Technical Decisions Made

### Architecture Choices
- **React Native + Expo**: Chosen for cross-platform mobile development
- **Supabase**: Selected for backend-as-a-service with real-time capabilities
- **TypeScript**: Used throughout for type safety
- **Expo Router**: File-based routing with typed navigation

### AI Service Integration
- **OpenAI GPT-4**: Primary content generation engine
- **ElevenLabs**: Voice synthesis with custom voice cloning
- **Creatomate**: Video rendering service (integration pending)

### Database Design
- **User-centric**: All data tied to authenticated users
- **Profile-based**: Editorial profiles for content personalization
- **Asset tracking**: Source videos and generated content management

## Current Challenges

### Implementation Gaps
1. **Creatomate Integration**: Video template generation and rendering
2. **Complete UI Implementation**: Many screens need full interface development
3. **Error Handling**: Comprehensive error states and user feedback
4. **Performance Optimization**: Mobile-specific optimizations

### Technical Debt
- **Type Definitions**: Incomplete Supabase type definitions
- **Component Library**: Need standardized UI components
- **Testing**: No testing infrastructure in place
- **Documentation**: Limited inline code documentation

## Next Priority Areas

### Immediate (High Priority)
1. **Complete Video Generation Pipeline**: Finish Creatomate integration
2. **UI Implementation**: Build out main screen interfaces
3. **Error Handling**: Add comprehensive error states
4. **Testing**: Set up basic testing framework

### Short-term (Medium Priority)
1. **Performance Optimization**: Mobile-specific improvements
2. **User Feedback**: Toast notifications and loading states
3. **Content Management**: Better video and script organization
4. **Settings Implementation**: User preferences and configuration

### Long-term (Lower Priority)
1. **Advanced Features**: Batch processing, templates, analytics
2. **Platform Expansion**: Web version consideration
3. **Monetization**: Subscription and payment integration
4. **Internationalization**: Multi-language support

## Development Patterns Established

### Code Organization
- Feature-based folder structure
- Shared libraries in `/lib` directory
- Type definitions in `/types`
- API routes in `/app/api`

### AI Integration Patterns
- Sequential agent processing
- Prompt engineering with context injection
- Error handling and validation
- Output optimization for specific services

### Mobile Development Patterns
- Tab-based navigation
- Modal screens for flows
- Async processing with status updates
- Local storage for offline capabilities

## Key Learnings

### AI Content Generation
- TikTok content requires specific script structure (Hook → Insight → Punch)
- ElevenLabs TTS needs optimized punctuation and sentence structure
- Editorial profiles are crucial for consistent brand voice
- 30-60 second duration constraint shapes content strategy

### Mobile Development
- Expo Router provides excellent developer experience
- Supabase real-time updates work well for status tracking
- File upload handling requires careful UX consideration
- Tab navigation suits the app's core workflow

### User Experience
- French-language interface is primary requirement
- Onboarding flow is critical for user success
- Real-time feedback improves perceived performance
- Simple, focused interfaces work best for mobile
