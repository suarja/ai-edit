# Survey Processing API

The Survey Processing API is a Supabase Edge Function that handles audio recording processing, transcription, and editorial profile generation during the onboarding flow.

## API Overview

**Endpoint**: `${SUPABASE_URL}/functions/v1/process-onboarding`  
**Method**: `POST`  
**Authentication**: Required (Supabase anon key)  
**Content-Type**: `multipart/form-data`

This endpoint is implemented in `supabase/functions/process-onboarding/index.ts`.

## Request Format

The API expects a multipart form data submission with the following fields:

| Field         | Type          | Description                             |
| ------------- | ------------- | --------------------------------------- |
| `file`        | File          | Audio recording file (MP3, WAV, M4A)    |
| `userId`      | String        | UUID of the authenticated user          |
| `survey_data` | String (JSON) | JSON string containing survey responses |

### Survey Data Format

```json
{
  "content_goals": "Increase audience engagement",
  "pain_points": "Time-consuming editing process",
  "content_style": "Educational and informative",
  "platform_focus": "YouTube and Instagram",
  "content_frequency": "Weekly"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "profile": {
    "persona_description": "Educational content creator focused on clear explanations",
    "tone_of_voice": "Professional yet conversational",
    "audience": "Tech enthusiasts and learners",
    "style_notes": "Includes visual examples and step-by-step instructions"
  },
  "message": "Profile created and voice clone initiated"
}
```

### Error Response

```json
{
  "error": "Failed to transcribe audio: Invalid audio format",
  "detail": "Additional error details if available"
}
```

## Implementation Details

The API endpoint follows a structured processing flow:

### 1. Request Validation

```typescript
// Validate required fields
if (!audioFile || !userId) {
  throw new Error('Missing required fields: file and userId are required');
}

// Validate audio file format and size
await validateAudioFile(audioFile);

// Verify user exists in database
await ensureUserExists(userId);
```

### 2. Audio Processing

```typescript
// Upload audio file to storage
const audioUrl = await uploadAudioFile(userId, audioBlob);

// Transcribe audio using OpenAI Whisper
const transcription = await transcribeAudio(audioBlob);
```

### 3. Content Analysis

```typescript
// Analyze transcription with GPT-4
const profile = await analyzeContent(transcription);
```

### 4. Database Updates

```typescript
// Save editorial profile
const { error: profileError } = await supabase
  .from('editorial_profiles')
  .upsert({
    user_id: userId,
    ...profile,
  });

// Update or create voice clone record
const { error: voiceError } = await supabase.from('voice_clones').upsert({
  id: existingVoiceClone?.id,
  user_id: userId,
  status: 'pending',
  sample_files: [
    {
      name: 'onboarding_recording.m4a',
      url: audioUrl,
    },
  ],
});

// Save survey data
if (surveyData) {
  const { error: surveyError } = await supabase
    .from('onboarding_survey')
    .upsert({
      user_id: userId,
      content_goals: surveyData.content_goals,
      pain_points: surveyData.pain_points,
      content_style: surveyData.content_style,
      platform_focus: surveyData.platform_focus,
      content_frequency: surveyData.content_frequency,
    });
}
```

## Audio Validation

The endpoint enforces strict validation for audio files:

```typescript
// Supported audio formats
const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function validateAudioFile(file: File): Promise<void> {
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    throw new Error('Unsupported audio format. Please use MP3, WAV, or M4A.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit.');
  }
}
```

## OpenAI Integration

The API uses OpenAI for two key functions:

1. **Audio Transcription** - Using Whisper model to convert speech to text
2. **Content Analysis** - Using GPT-4 to generate editorial profile from transcription

```typescript
// Transcription example
const transcription = await openai.audio.transcriptions.create({
  file,
  model: 'whisper-1',
  response_format: 'text',
  language: 'en',
});

// Content analysis example
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: `You are an AI assistant helping to create an editorial profile...`,
    },
    {
      role: 'user',
      content: text,
    },
  ],
  response_format: { type: 'json_object' },
});
```

## Error Handling

The API implements comprehensive error handling:

- **Request Validation Errors**: Missing fields, invalid file types
- **Audio Processing Errors**: Empty files, transcription failures
- **Database Errors**: Failed inserts/updates
- **API Integration Errors**: OpenAI service failures

Each error is properly formatted and returned with an appropriate status code.

## Usage from Client

```typescript
const handleRecordingSubmit = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/x-m4a',
      name: 'recording.m4a',
    });
    formData.append('userId', userId);
    formData.append('survey_data', JSON.stringify(surveyAnswers));

    const result = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-onboarding`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    if (!result.ok) {
      throw new Error('Failed to process recording');
    }

    const data = await result.json();
    return data;
  } catch (error) {
    console.error('Error submitting recording:', error);
    throw error;
  }
};
```

## Related Endpoints

- **`/functions/v1/create-voice-clone`**: Creates an ElevenLabs voice clone

## Memory Bank References

For detailed implementation notes, refer to:

- [Onboarding Data Flow](../../../memory-bank/onboarding-data-flow.md)
- [Onboarding Survey DB Fix](../../../memory-bank/onboarding-survey-db-fix.md)

## Authentication Requirements

This endpoint requires authentication using the Supabase anon key:

```
Authorization: Bearer ${SUPABASE_ANON_KEY}
```

## CORS Configuration

The endpoint supports Cross-Origin Resource Sharing (CORS) with the following headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
```
