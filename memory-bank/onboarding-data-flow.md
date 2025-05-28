# Onboarding Data Flow

## Overview

The onboarding flow collects user data across multiple screens and processes it to personalize the user experience. This document outlines how data flows through the system and where it's stored.

## Data Collection Points

### 1. Survey Screen

- **Data Collected**: Content goals, pain points, content style, platform focus, and content frequency
- **Storage**: Initially stored in the `OnboardingProvider` context as `surveyAnswers` (in-memory)
- **Collection Method**: User selects options for each question which triggers `setSurveyAnswer(questionId, answerId)`

### 2. Voice Recording Screen

- **Data Collected**: Audio recording for voice cloning
- **Storage**: Temporarily stored as a local file, then uploaded to the server
- **Collection Method**: User records audio which is processed by the `processRecording` function
- **Processing**:
  1. Audio is processed locally and converted to a blob
  2. File is uploaded to Supabase via the `process-onboarding` function
  3. Survey answers are included in the request (`Object.entries(surveyAnswers).forEach...`)

### 3. Editorial Profile Screen

- **Data Collected**: Persona description, tone of voice, target audience, style notes
- **Storage**: Stored in the `editorial_profiles` table in Supabase
- **Collection Method**: User inputs text into form fields

## Data Storage and Processing

### Client-Side Storage

- **OnboardingProvider Context**: Temporary in-memory storage during the onboarding session
  ```typescript
  const [surveyAnswers, setSurveyAnswers] =
    useState<SurveyAnswers>(initialSurveyAnswers);
  ```
- **Step Completion Tracking**: Also stored in context to track user progress
  ```typescript
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>(
    initialCompletedSteps
  );
  ```

### Server-Side Storage

1. **Supabase Tables**:

   - `editorial_profiles`: Stores user preferences and content style information
   - `voice_clones`: Stores information about the user's voice clone
   - `user`: Core user information

2. **Backend Functions**:
   - `process-onboarding`: Handles voice recording processing and initial profile setup
   - Integrates with third-party services for voice cloning

## Data Utilization

The collected data is used to:

1. **Personalize the user experience** by tailoring content templates and suggestions
2. **Create a voice clone** for generating AI content with the user's voice
3. **Set up an editorial profile** that guides content creation
4. **Customize AI model prompts** to match the user's style and preferences

## Future Enhancements

1. **Analytics tracking**: Implement tracking for each step of the onboarding process
2. **Progress persistence**: Save partial progress to allow users to continue onboarding later
3. **Data synchronization**: Ensure data consistency across devices
4. **Privacy controls**: Add options for users to manage their data

## Issues to Address

1. **Data persistence**: Currently, survey data is lost if the app is closed during onboarding
2. **Error handling**: Improve error handling for network issues during data submission
3. **Existing user handling**: Better handling of users with existing profiles
4. **Data validation**: Add comprehensive validation before server submission
