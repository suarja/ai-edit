import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchAudioFile(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching audio file:', error);
    throw new Error('Failed to fetch audio file');
  }
}

async function uploadToElevenLabs(name: string, files: { uri: string; name: string }[]) {
  const formData = new FormData();
  formData.append('name', name);
  
  // Add each audio file to the FormData
  for (const [index, file] of files.entries()) {
    try {
      const audioBlob = await fetchAudioFile(file.uri);
      // Ensure unique filename with proper extension
      const filename = `recording-${index + 1}${file.name.match(/\.[^.]+$/)?.[0] || '.mp3'}`;
      formData.append('files', audioBlob, filename);
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
      throw new Error(`Failed to process file ${file.name}`);
    }
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch {
        errorDetail = errorText;
      }
      throw new Error(
        typeof errorDetail === 'object' ? 
          errorDetail.detail || JSON.stringify(errorDetail) : 
          errorDetail
      );
    }

    return await response.json();
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
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
    const { name, recordings, userId } = await req.json();

    if (!name || !recordings || !userId || !Array.isArray(recordings) || recordings.length === 0) {
      throw new Error('Invalid input. Required: name (string), recordings (array), userId (string)');
    }

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Verify user exists before proceeding
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      throw new Error('User not found. Please ensure you are properly authenticated.');
    }

    const elevenlabsResponse = await uploadToElevenLabs(name, recordings);

    // Get existing voice clone if any
    const existingVoiceClone = await getExistingVoiceClone(userId);

    // Update or create voice clone
    const { error: dbError } = await supabase
      .from('voice_clones')
      .upsert({
        id: existingVoiceClone?.id, // Will be undefined for new records
        user_id: userId,
        elevenlabs_voice_id: elevenlabsResponse.voice_id,
        status: 'ready',
        sample_files: recordings.map(r => ({ name: r.name, uri: r.uri })),
      });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        voice_id: elevenlabsResponse.voice_id,
        message: 'Voice clone created successfully'
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
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});