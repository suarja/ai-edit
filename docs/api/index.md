# API Documentation

This section provides documentation for the AI Edit API endpoints and their usage.

## API Overview

AI Edit provides several API endpoints for interacting with the platform programmatically:

- **Authentication APIs**: User registration, login, and token management
- **Content Generation APIs**: Video and script generation
- **Voice APIs**: Voice clone management and synthesis
- **Content Management APIs**: Asset management and organization

## Authentication

- [Authentication Overview](./auth/overview.md)
- [User Registration](./auth/registration.md)
- [Login & Token Management](./auth/login.md)

## Content Generation

- [Video Generation](./content/video-generation.md)
- [Script Generation](./content/script-generation.md)
- [Edit Requests](./content/edit-requests.md)

For implementation details of the video generation API, see [app/api/videos/generate+api.ts](../../app/api/videos/generate+api.ts).

## Voice APIs

- [Voice Clone Creation](./voice/clone-creation.md)
- [Voice Synthesis](./voice/synthesis.md)
- [Voice Management](./voice/management.md)

For implementation details of the voice clone API, see [supabase/functions/create-voice-clone/index.ts](../../supabase/functions/create-voice-clone/index.ts).

## Onboarding APIs

- [Survey Processing](./onboarding/survey-processing.md)
- [Profile Generation](./onboarding/profile-generation.md)

For implementation details of the onboarding process API, see [supabase/functions/process-onboarding/index.ts](../../supabase/functions/process-onboarding/index.ts).

## Response Formats

All API endpoints follow a consistent response format:

```json
{
  "success": true|false,
  "data": { ... },  // Present on successful responses
  "error": { ... }  // Present on error responses
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Clients

- [JavaScript/TypeScript Client](./clients/typescript.md)
- [React Native Integration](./clients/react-native.md)

## Rate Limits

API rate limits are enforced to ensure fair usage:

- Free tier: 10 requests per minute
- Pro tier: 60 requests per minute
- Enterprise tier: Custom limits available

For more details on API implementation, refer to the [system patterns](../../memory-bank/systemPatterns.md) in the memory bank.
