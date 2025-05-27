# System Patterns: AI Edit

## Architecture Patterns

### Mobile-First Design
- **React Native + Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing with typed navigation
- **Tab-based Navigation**: Main app organized around core functions
- **Modal Screens**: Onboarding and settings as overlay screens

### Backend-as-a-Service (BaaS)
- **Supabase Integration**: Database, auth, storage, and edge functions
- **Real-time Updates**: Live status tracking for video generation
- **Row Level Security**: Database-level access control
- **Edge Functions**: Serverless processing for AI integrations

## Data Flow Patterns

### Video Generation Pipeline
```
User Input → Script Generation → Script Review → Template Generation → Video Rendering → Status Polling → Delivery
```

1. **Input Processing**: User prompt + editorial profile + source videos
2. **AI Processing**: Sequential AI agent execution
3. **Template Generation**: Creatomate JSON creation
4. **Async Rendering**: Background video processing
5. **Status Updates**: Real-time progress tracking
6. **Result Delivery**: Final video download/streaming

### Authentication Flow
```
Landing → Sign In/Up → Onboarding → Main App
```

- **Supabase Auth**: Email/password authentication
- **Protected Routes**: Auth guards on main app sections
- **Session Management**: Automatic token refresh

## Component Patterns

### Screen Organization
- **Layout Components**: `_layout.tsx` files for route grouping
- **Screen Components**: Individual page implementations
- **Shared Components**: Reusable UI elements (buttons, forms, etc.)

### State Management
- **Local State**: React hooks for component-level state
- **Global State**: Context providers for shared data
- **Server State**: Supabase real-time subscriptions
- **Persistent State**: AsyncStorage for offline data

## AI Agent Patterns

### Sequential Processing
- **ScriptGenerator**: Initial content creation
- **ScriptReviewer**: Content optimization
- **CreatomateBuilder**: Template generation
- Each agent has specific responsibilities and outputs

### Prompt Engineering
- **System Prompts**: Detailed instructions for AI behavior
- **Context Injection**: Editorial profile integration
- **Output Validation**: Duration and format checking
- **Error Handling**: Graceful failure and retry logic

## API Design Patterns

### RESTful Endpoints
- **Resource-based URLs**: `/api/videos/generate`, `/api/videos/status/[id]`
- **HTTP Methods**: POST for creation, GET for status
- **Status Codes**: Proper HTTP response codes
- **Error Responses**: Consistent error format

### Async Processing
- **Job Queue Pattern**: Background video processing
- **Status Polling**: Client-side progress checking
- **Webhook Integration**: External service callbacks
- **Timeout Handling**: Long-running process management

## Database Patterns

### Relational Design
- **User-centric**: All data tied to authenticated users
- **Profile-based**: Editorial profiles for content customization
- **Asset Management**: Source videos and generated content
- **Audit Trail**: Creation timestamps and status tracking

### Security Patterns
- **Row Level Security**: Database-level access control
- **User Isolation**: Data segregation by user ID
- **Public Assets**: Controlled public access to generated videos
- **API Key Management**: Secure external service integration

## File Storage Patterns

### Supabase Storage
- **Public Bucket**: Generated videos accessible via URL
- **Upload Policies**: Authenticated user uploads only
- **File Organization**: User-based folder structure
- **Cleanup Policies**: Automatic old file removal

### Asset Management
- **Source Videos**: User-uploaded content for templates
- **Generated Videos**: AI-created final outputs
- **Thumbnails**: Preview images for video assets
- **Metadata**: File size, duration, format information

## Error Handling Patterns

### Client-Side
- **Try-Catch Blocks**: Async operation error handling
- **User Feedback**: Toast notifications and error states
- **Retry Logic**: Automatic retry for transient failures
- **Graceful Degradation**: Fallback UI states

### Server-Side
- **Validation**: Input sanitization and validation
- **Service Errors**: External API failure handling
- **Database Errors**: Connection and query error handling
- **Logging**: Comprehensive error logging for debugging

## Performance Patterns

### Mobile Optimization
- **Lazy Loading**: On-demand content loading
- **Image Optimization**: Efficient asset handling
- **Background Processing**: Non-blocking operations
- **Memory Management**: Proper cleanup and disposal

### Caching Strategies
- **Local Storage**: Offline data persistence
- **API Caching**: Response caching for repeated requests
- **Asset Caching**: Local video and image caching
- **Real-time Updates**: Efficient data synchronization

## Development Patterns

### Code Organization
- **Feature-based Structure**: Grouped by functionality
- **Shared Libraries**: Common utilities and helpers
- **Type Safety**: TypeScript throughout the application
- **Configuration Management**: Environment-based settings

### Testing Strategies
- **Unit Testing**: Individual component testing
- **Integration Testing**: API and database testing
- **E2E Testing**: Full user flow validation
- **Performance Testing**: Load and stress testing
