import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Enhanced logging helper
function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console[level](
    `[${timestamp}] create-voice-clone: ${message}`,
    data ? JSON.stringify(data, null, 2) : ''
  );
}

async function ensureUserExists(userId: string): Promise<boolean> {
  log('info', `Checking user existence`, { userId });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      log('error', `User verification failed`, {
        userId,
        error: error.message,
      });
      throw new Error(`Failed to verify user: ${error.message}`);
    }

    const exists = !!user;
    log('info', `User verification result`, { userId, exists });
    return exists;
  } catch (error) {
    log('error', `User existence check failed`, {
      userId,
      error: error.message,
    });
    throw error;
  }
}

async function getExistingVoiceClone(userId: string) {
  log('info', `Checking for existing voice clone`, { userId });

  try {
    const { data, error } = await supabase
      .from('voice_clones')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      log('error', `Database error checking voice clone`, {
        userId,
        error: error.message,
      });
      throw error;
    }

    log('info', `Existing voice clone check result`, {
      userId,
      exists: !!data,
      id: data?.id,
    });
    return data;
  } catch (error) {
    log('error', `Voice clone check failed`, { userId, error: error.message });
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  log('info', `Request started`, { requestId, method: req.method });

  try {
    // Validate environment variables
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration not complete');
    }

    // Parse FormData
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const userId = formData.get('userId') as string;

    // Récupérer tous les fichiers
    const files = formData.getAll('files') as File[];

    log('info', `Request parsed`, {
      requestId,
      name: name || 'missing',
      userId: userId || 'missing',
      filesCount: files.length,
    });

    // Enhanced input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Invalid input: name must be a non-empty string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid input: userId must be a string');
    }

    if (!files || files.length === 0) {
      throw new Error('Invalid input: no audio files provided');
    }

    log('info', `Input validation passed`, { requestId });

    // Verify user exists before proceeding
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      throw new Error(
        'User not found. Please ensure you are properly authenticated.'
      );
    }

    // Test ElevenLabs API d'abord
    log('info', `Testing ElevenLabs API connectivity`, { requestId });

    try {
      const testResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
      });

      if (!testResponse.ok) {
        log('error', `ElevenLabs API test failed`, {
          status: testResponse.status,
          statusText: testResponse.statusText,
        });
        throw new Error(
          `ElevenLabs API not accessible (${testResponse.status})`
        );
      }

      log('info', `ElevenLabs API test successful`, { requestId });
    } catch (testError: any) {
      log('error', `ElevenLabs API test error`, {
        error: testError.message,
      });
      throw new Error(`Cannot connect to ElevenLabs: ${testError.message}`);
    }

    // Upload to ElevenLabs - SIMPLE
    log('info', `Starting ElevenLabs upload process`, { requestId });

    const elevenlabsFormData = new FormData();
    elevenlabsFormData.append('name', name);

    // Ajouter chaque fichier directement
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      elevenlabsFormData.append(
        'files',
        file,
        file.name || `recording-${i + 1}.m4a`
      );
      log('info', `Added file to ElevenLabs FormData`, {
        fileName: file.name,
        size: file.size,
      });
    }

    const elevenlabsResponse = await fetch(
      'https://api.elevenlabs.io/v1/voices/add',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: elevenlabsFormData,
      }
    );

    log('info', `ElevenLabs response received`, {
      status: elevenlabsResponse.status,
      statusText: elevenlabsResponse.statusText,
      headers: Object.fromEntries(elevenlabsResponse.headers.entries()),
    });

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text();
      log('error', `ElevenLabs API error`, {
        status: elevenlabsResponse.status,
        errorText,
      });
      throw new Error(
        `ElevenLabs API error (${elevenlabsResponse.status}): ${errorText}`
      );
    }

    // Debug: log response before parsing JSON
    const responseText = await elevenlabsResponse.text();
    log('info', `ElevenLabs raw response`, {
      responseText:
        responseText.substring(0, 200) +
        (responseText.length > 200 ? '...' : ''),
      responseLength: responseText.length,
    });

    let elevenlabsResult;
    try {
      elevenlabsResult = JSON.parse(responseText);
    } catch (jsonError: any) {
      log('error', `Failed to parse ElevenLabs JSON response`, {
        jsonError: jsonError.message,
        responseText: responseText.substring(0, 500),
      });
      throw new Error(`ElevenLabs returned invalid JSON: ${jsonError.message}`);
    }

    log('info', `ElevenLabs upload successful`, {
      voice_id: elevenlabsResult.voice_id,
    });

    // Get existing voice clone if any
    const existingVoiceClone = await getExistingVoiceClone(userId);

    // Prepare database record
    const voiceCloneData = {
      id: existingVoiceClone?.id,
      user_id: userId,
      elevenlabs_voice_id: elevenlabsResult.voice_id,
      status: 'ready',
      sample_files: files.map((f, i) => ({
        name: f.name || `recording-${i + 1}.m4a`,
      })),
    };

    log('info', `Saving to database`, {
      requestId,
      isUpdate: !!existingVoiceClone,
    });

    // Update or create voice clone
    const { data: dbData, error: dbError } = await supabase
      .from('voice_clones')
      .upsert(voiceCloneData)
      .select();

    if (dbError) {
      log('error', `Database save failed`, {
        requestId,
        error: dbError.message,
        code: dbError.code,
      });
      throw new Error(`Database error: ${dbError.message}`);
    }

    log('info', `Voice clone created successfully`, {
      requestId,
      voice_id: elevenlabsResult.voice_id,
      dbRecordId: dbData?.[0]?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        voice_id: elevenlabsResult.voice_id,
        message: 'Voice clone created successfully',
        requestId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    log('error', `Request failed`, {
      requestId,
      error: error.message,
      stack: error.stack,
    });

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('Invalid input')) {
      statusCode = 400;
    } else if (
      error.message.includes('User not found') ||
      error.message.includes('not authenticated')
    ) {
      statusCode = 401;
    } else if (error.message.includes('ElevenLabs API error')) {
      statusCode = 502;
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        detail: error.detail || null,
        requestId,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
