# Video Generation API

The Video Generation API is a core endpoint that enables the creation of AI-powered videos in the AI Edit platform.

## API Overview

**Endpoint**: `/api/videos/generate`
**Method**: `POST`
**Authentication**: Required (Bearer token)

This endpoint processes video generation requests, validates inputs, and initiates the video creation pipeline. It's implemented in `app/api/videos/generate+api.ts`.

## Request Format

```json
{
  "prompt": "Create a video about renewable energy",
  "style": "educational",
  "duration": 60,
  "aspectRatio": "9:16",
  "voiceId": "voice_clone_id_123",
  "templateId": "template_id_456",
  "language": "en"
}
```

### Required Parameters

- `prompt`: Text description of the video content
- `style`: Style identifier (educational, promotional, etc.)

### Optional Parameters

- `duration`: Target video duration in seconds (default: 60)
- `aspectRatio`: Video aspect ratio (default: "16:9")
- `voiceId`: ElevenLabs voice ID for narration
- `templateId`: Creatomate template ID
- `language`: Content language (default: "en")

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "requestId": "req_123456789",
    "scriptId": "script_987654321"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Failed to process video request",
    "details": { ... }
  }
}
```

## Implementation Details

The API endpoint follows a structured processing flow:

1. **Authentication Verification**

   ```typescript
   const authHeader = request.headers.get('Authorization');
   const { user, errorResponse: authError } = await AuthService.verifyUser(
     authHeader
   );
   ```

2. **Request Validation**

   ```typescript
   const validationResult = VideoValidationService.validateRequest(requestBody);
   if (!validationResult.success) {
     return validationResult.error;
   }
   ```

3. **Video Generation**

   ```typescript
   const videoGenerator = new VideoGeneratorService(user);
   const result = await videoGenerator.generateVideo(validationResult.payload);
   ```

4. **Response Handling**

   ```typescript
   return successResponse(
     {
       requestId: result.requestId,
       scriptId: result.scriptId,
     },
     HttpStatus.CREATED
   );
   ```

5. **Error Handling**
   ```typescript
   catch (error: any) {
     console.error('❌ Error in video generation:', error);
     const statusCode = determineErrorStatusCode(error);
     return errorResponse(
       error.message || 'Failed to process video request',
       statusCode,
       process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
     );
   }
   ```

## Error Status Code Determination

The API uses a specialized function to determine appropriate HTTP status codes based on error types:

```typescript
function determineErrorStatusCode(error: any): number {
  // Database errors
  if (
    error.code &&
    (error.code.startsWith('22') ||
      error.code.startsWith('23') ||
      error.code === 'PGRST')
  ) {
    return HttpStatus.BAD_REQUEST;
  }

  // Authentication/authorization errors
  if (
    error.message &&
    (error.message.includes('auth') || error.message.includes('token'))
  ) {
    return HttpStatus.UNAUTHORIZED;
  }

  // Missing resources
  if (
    error.message &&
    (error.message.includes('not found') || error.message.includes('missing'))
  ) {
    return HttpStatus.NOT_FOUND;
  }

  // External API errors
  if (error.message && error.message.includes('Creatomate')) {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  // Default to internal server error
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
```

## Authentication

This endpoint requires a valid authentication token. The token should be provided in the Authorization header:

```
Authorization: Bearer <token>
```

The `AuthService.verifyUser` function handles token validation and user retrieval.

## Service Dependencies

The endpoint relies on several services:

- **AuthService**: User authentication and validation
- **VideoValidationService**: Request validation and sanitization
- **VideoGeneratorService**: Core video generation logic

## Video Generation Process

When a request is received, the following happens:

1. The user is authenticated
2. The request payload is validated
3. A script is generated using AI
4. The script is converted to narration using the user's voice clone
5. Visual elements are rendered using Creatomate
6. The video is assembled and stored
7. A reference to the video is returned

## Related Endpoints

- **`/api/videos/{id}`**: Retrieve video details
- **`/api/scripts/{id}`**: Retrieve generated script
- **`/api/videos/{id}/status`**: Check video generation status

## Memory Bank References

For detailed implementation notes, refer to:

- [System Patterns](../../../memory-bank/systemPatterns.md)
- [Technical Context](../../../memory-bank/techContext.md)

## Example Usage

```javascript
const generateVideo = async (prompt, style) => {
  const response = await fetch('/api/videos/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      prompt,
      style,
      duration: 60,
      aspectRatio: '9:16',
    }),
  });

  return await response.json();
};
```
