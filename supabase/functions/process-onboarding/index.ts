import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import OpenAI from 'npm:openai@4.28.0';

// Validate environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ELEVENLABS_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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
  console.log('Validating audio file:', {
    type: file.type,
    size: file.size,
    name: file.name,
  });

  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    throw new Error('Unsupported audio format. Please use MP3, WAV, or M4A.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit.');
  }
}

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('Starting audio transcription');

    // Ensure we have a valid MIME type
    const mimeType = audioBlob.type || 'audio/x-m4a';

    // Create a proper File object from the Blob with explicit type
    const file = new File([audioBlob], 'recording.m4a', {
      type: mimeType,
    });

    // Verify file is not empty
    if (file.size === 0) {
      throw new Error('Audio file is empty');
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'text',
      language: 'en',
    });

    console.log('Transcription completed successfully');
    return transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

async function analyzeContent(text: string) {
  try {
    console.log('Starting content analysis with enhanced prompt');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert content strategist and social media consultant specializing in TikTok, Instagram, and YouTube content. 
          
          Your task is to create a comprehensive editorial profile for a content creator based on their introduction or voice sample transcription. This profile will be used to generate scripts and content that perfectly match their unique style and brand voice.
          
          Extract a detailed, actionable editorial profile in JSON format with these fields:
          
          - persona_description: A rich, detailed description (150-200 words) of their personal brand as a content creator, including:
            * Their unique perspective and content niche
            * Areas of expertise and authority
            * Professional background and qualifications
            * Content identity and what makes them stand out
            * Core values and beliefs that drive their content
          
          - tone_of_voice: A comprehensive analysis (150-200 words) of their speaking style and communication patterns:
            * Vocal characteristics (pace, pitch, energy level)
            * Language complexity and vocabulary preferences
            * Emotional tone (humorous, serious, inspirational, educational)
            * Sentence structure and rhythm patterns
            * Distinctive phrases, expressions, or verbal tics
            * Use of questions, metaphors, or storytelling techniques
          
          - audience: A detailed profile (150-200 words) of their ideal target audience:
            * Demographic characteristics (age range, educational background)
            * Psychographic details (interests, values, aspirations)
            * Pain points and challenges this audience faces
            * What this audience hopes to gain from the creator's content
            * Relationship dynamic between creator and audience
          
          - style_notes: Specific, actionable guidelines (150-200 words) for content creation:
            * Content structure preferences (how they organize information)
            * Visual presentation style
            * Engagement strategies they employ
            * Call-to-action patterns
            * Content length preferences
            * Hook strategies they use to capture attention
            * Types of examples or references they typically use
          
          When information is ambiguous or missing, provide thoughtful inferences based on their overall communication style and content category. Focus on creating a detailed, nuanced profile that could genuinely guide content creation in their authentic voice.
          
          The profile should be so specific and personalized that it could only apply to this particular creator, not generic advice that could apply to anyone.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('Enhanced content analysis completed successfully');
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Content analysis error:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

async function ensureUserExists(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking user existence:', error);
    throw new Error(`Failed to verify user: ${error.message}`);
  }

  return !!user;
}

async function uploadAudioFile(
  userId: string,
  audioBlob: Blob
): Promise<string> {
  try {
    console.log('Starting audio file upload');
    const fileName = `voice-samples/${userId}/${crypto.randomUUID()}.m4a`;

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/x-m4a',
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(fileName);

    console.log('Audio file uploaded successfully');
    return publicUrl;
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error(`Failed to upload audio file: ${error.message}`);
  }
}

async function getExistingVoiceClone(userId: string) {
  const { data, error } = await supabase
    .from('voice_clones')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    throw error;
  }

  return data;
}

async function initiateVoiceCloning(userId: string, audioUrl: string) {
  try {
    console.log('Starting voice clone initiation with ElevenLabs API');

    // Verify API key is available
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key is missing');
    }

    // First, get the audio file content from the URL
    console.log(`Fetching audio sample from URL: ${audioUrl}`);
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error(
        `Failed to fetch audio sample: ${audioResponse.statusText}`
      );
    }

    const audioBlob = await audioResponse.blob();
    console.log(`Successfully fetched audio sample (${audioBlob.size} bytes)`);

    // Create a name for the voice clone
    const voiceName = `User_${userId.substring(0, 8)}_Voice`;
    const description = 'Voice clone created during app onboarding';

    // Create FormData for the API request
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('description', description);
    formData.append('files', audioBlob, 'sample.m4a');

    // Make the API call to ElevenLabs to create the voice
    console.log('Making API call to ElevenLabs to create voice clone');
    const elevenLabsResponse = await fetch(
      'https://api.elevenlabs.io/v1/voices/add',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          // No Content-Type header as FormData sets it automatically with boundary
        },
        body: formData,
      }
    );

    // Parse and log the response
    const responseData = await elevenLabsResponse.json();

    if (!elevenLabsResponse.ok) {
      console.error('ElevenLabs API error:', responseData);
      throw new Error(
        `ElevenLabs API error: ${
          responseData.detail || elevenLabsResponse.statusText
        }`
      );
    }

    console.log('Voice clone created successfully with ElevenLabs:', {
      voiceId: responseData.voice_id,
      name: responseData.name,
    });

    // Return the voice ID from ElevenLabs for storage
    return {
      success: true,
      voice_id: responseData.voice_id,
      name: responseData.name,
    };
  } catch (error) {
    console.error('Voice cloning initiation error:', error);
    // Return detailed error information but don't fail the whole process
    return {
      success: false,
      error: error.message || 'Unknown error during voice cloning',
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const surveyDataStr = formData.get('survey_data') as string;

    if (!audioFile || !userId) {
      throw new Error('Missing required fields: file and userId are required');
    }

    console.log('Received file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Parse survey data if available
    let surveyData = null;
    if (surveyDataStr) {
      try {
        surveyData = JSON.parse(surveyDataStr);
        console.log('Received survey data:', surveyData);
      } catch (error: any) {
        console.error('Error parsing survey data:', error);
        // Continue execution - we don't want to fail the whole process if only survey data parsing fails
      }
    }

    // Validate audio file
    await validateAudioFile(audioFile);

    // Verify user exists
    await ensureUserExists(userId);

    // Convert File to Blob with explicit type preservation
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || 'audio/x-m4a',
    });

    // Upload audio file to storage
    const audioUrl = await uploadAudioFile(userId, audioBlob);

    // Transcribe audio
    const transcription = await transcribeAudio(audioBlob);

    // Analyze content
    const profile = await analyzeContent(transcription);

    // Save to database
    const { error: profileError } = await supabase
      .from('editorial_profiles')
      .upsert({
        user_id: userId,
        ...profile,
      });

    if (profileError) {
      console.error('Error saving editorial profile:', profileError);
      throw profileError;
    }

    // Get existing voice clone if any
    const existingVoiceClone = await getExistingVoiceClone(userId);

    // Initiate voice cloning process with ElevenLabs
    const voiceCloneResult = await initiateVoiceCloning(userId, audioUrl);
    console.log('Voice clone initiation result:', voiceCloneResult);

    // Determine status and error message based on result
    const cloneStatus = voiceCloneResult.success ? 'completed' : 'failed';
    const lastError = voiceCloneResult.success ? null : voiceCloneResult.error;

    // Update or create voice clone record with more detailed information
    const { error: voiceError } = await supabase.from('voice_clones').upsert({
      id: existingVoiceClone?.id, // Will be undefined for new records
      user_id: userId,
      status: cloneStatus,
      voice_id: voiceCloneResult.voice_id || null,
      voice_name: voiceCloneResult.name || null,
      sample_files: [
        {
          name: 'onboarding_recording.m4a',
          url: audioUrl,
        },
      ],
      last_error: lastError,
      last_updated: new Date().toISOString(),
    });

    if (voiceError) {
      console.error('Error creating/updating voice clone:', voiceError);
      throw voiceError;
    }

    // Save survey data to onboarding_survey table
    if (surveyData) {
      try {
        const { error: surveyError } = await supabase
          .from('onboarding_survey')
          .upsert({
            user_id: userId, // Now this works directly as UUID
            content_goals: surveyData.content_goals,
            pain_points: surveyData.pain_points,
            content_style: surveyData.content_style,
            platform_focus: surveyData.platform_focus,
            content_frequency: surveyData.content_frequency,
          });

        if (surveyError) {
          console.error('Error saving survey data:', surveyError);
        } else {
          console.log('Survey data saved successfully');
        }
      } catch (saveError) {
        console.error('Exception during survey data save:', saveError);
      }
      // Continue execution - we don't want to fail the whole process if only survey data fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        voice_clone: {
          status: cloneStatus,
          voice_id: voiceCloneResult.voice_id || null,
          error: lastError,
        },
        message: `Profile created and voice clone ${cloneStatus}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error processing request:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        detail: error.detail || null,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
