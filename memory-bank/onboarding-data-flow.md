# Onboarding Data Flow

## Overview

This document outlines the data flow in the enhanced onboarding process, focusing on how user data is collected, processed, and stored during onboarding. It covers both the frontend components and backend processing.

## Database Tables

The following database tables are used in the onboarding process:

1. **`users`** - Core user information (automatically created by Supabase Auth)
2. **`editorial_profiles`** - Stores user's content creation profile information
3. **`voice_clones`** - Stores information about user's voice clone status and references
4. **`onboarding_survey`** - Stores user's responses to onboarding survey questions

## Frontend Components

### OnboardingProvider

The `OnboardingProvider` is the central state management component for the onboarding flow:

- Manages the current step in the onboarding process
- Tracks completed steps
- Stores survey answers temporarily in memory
- Handles navigation between steps

### Survey Component

- Displays survey questions to the user
- Captures responses
- Stores answers in the OnboardingProvider state

### Voice Recording Screen

- Captures audio recording from the user
- Handles audio validation
- Uploads audio to the backend for processing
- Sends survey data along with the audio for context

### Editorial Profile Screen

- Displays AI-generated profile based on audio analysis
- Allows user to modify and save profile information
- Stores finalized profile in the database

## Backend Processing

### Edge Functions

1. **`process-onboarding`**

   - Receives audio file and survey data
   - Transcribes audio using OpenAI Whisper
   - Analyzes content using GPT-4
   - Extracts editorial profile information
   - Stores the profile in the `editorial_profiles` table
   - Initiates voice clone creation
   - Saves survey data to `onboarding_survey` table

2. **`create-voice-clone`**
   - Receives audio samples
   - Uploads to ElevenLabs for voice clone creation
   - Updates voice clone status in database

## Data Flow Sequence

1. **User enters the onboarding flow**

   - Initial state set up in `OnboardingProvider`

2. **Survey completion**

   - User answers questions in the survey screen
   - Responses stored temporarily in `OnboardingProvider`

3. **Voice recording**

   - User records audio sample
   - Audio validated on device
   - Audio file and survey data sent to `process-onboarding` function
   - Survey data stored in `onboarding_survey` table with user ID

4. **Backend processing**

   - Audio transcribed to text
   - Content analyzed to extract profile information
   - Editorial profile created/updated in database
   - Voice sample processed for voice cloning

5. **Editorial profile review**

   - User reviews AI-generated profile
   - Makes any necessary adjustments
   - Final profile saved to `editorial_profiles` table

6. **Subscription and completion**
   - User selects subscription plan
   - Onboarding process completed
   - User redirected to main application

## Survey Data Schema

The `onboarding_survey` table has the following schema:

```sql
CREATE TABLE onboarding_survey (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_goals TEXT,
  pain_points TEXT,
  content_style TEXT,
  platform_focus TEXT,
  content_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Voice Processing

1. Audio recording validated client-side:

   - File size check (< 10MB)
   - Format validation
   - Minimum duration check

2. Audio file uploaded to Supabase storage:

   - Stored in `audio/voice-samples/{user_id}/{uuid}.m4a`
   - Public URL generated for processing

3. Transcription and analysis:

   - Audio transcribed using OpenAI Whisper
   - Transcript analyzed using GPT-4 to extract profile information

4. Voice clone creation:
   - Audio sample sent to ElevenLabs
   - Voice clone ID returned and stored
   - Status tracked in database

## Error Handling

The system includes robust error handling:

- Client-side validation for audio recording
- Server-side validation for file size and format
- Clear error messages for users
- Fallback options if voice recording fails
- Recovery paths to retry processing

## Future Enhancements

- Batch processing for voice samples
- Multi-language support for transcription
- More detailed analytics on user preferences
- Enhanced profile generation using multiple inputs
