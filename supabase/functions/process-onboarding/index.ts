import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import OpenAI from 'npm:openai@4.28.0';

// Validate environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ELEVENLABS_API_KEY'
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported audio formats
const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function validateAudioFile(file: File): Promise<void> {
  console.log('Validating audio file:', {
    type: file.type,
    size: file.size,
    name: file.name
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
      type: mimeType
    });

    // Verify file is not empty
    if (file.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
      language: "en"
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
    console.log('Starting content analysis');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping to create an editorial profile for a content creator.
          Based on their introduction, extract the following information in JSON format:
          - persona_description: How they describe themselves as a content creator
          - tone_of_voice: Their speaking style and tone
          - audience: Their target audience
          - style_notes: Any specific content style preferences mentioned
          
          If any information is missing, provide reasonable defaults based on context.
          Keep the responses concise but meaningful.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    });

    console.log('Content analysis completed successfully');
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

async function uploadAudioFile(userId: string, audioBlob: Blob): Promise<string> {
  try {
    console.log('Starting audio file upload');
    const fileName = `voice-samples/${userId}/${crypto.randomUUID()}.m4a`;
    
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/x-m4a',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName);

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

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw error;
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!audioFile || !userId) {
      throw new Error('Missing required fields: file and userId are required');
    }

    console.log('Received file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validate audio file
    await validateAudioFile(audioFile);

    // Verify user exists
    await ensureUserExists(userId);

    // Convert File to Blob with explicit type preservation
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: audioFile.type || 'audio/x-m4a' 
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
        ...profile
      });

    if (profileError) {
      console.error('Error saving editorial profile:', profileError);
      throw profileError;
    }

    // Get existing voice clone if any
    const existingVoiceClone = await getExistingVoiceClone(userId);

    // Update or create voice clone
    const { error: voiceError } = await supabase
      .from('voice_clones')
      .upsert({
        id: existingVoiceClone?.id, // Will be undefined for new records
        user_id: userId,
        status: 'pending',
        sample_files: [{
          name: 'onboarding_recording.m4a',
          url: audioUrl
        }]
      });

    if (voiceError) {
      console.error('Error creating/updating voice clone:', voiceError);
      throw voiceError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        message: 'Profile created and voice clone initiated'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        detail: error.detail || null
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});