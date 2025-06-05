import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  S3Client,
  PutObjectCommand,
  PutBucketCorsCommand,
} from 'npm:@aws-sdk/client-s3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner';

// Validate environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const BUCKET_NAME = 'ai-edit-v1';

// Initialize S3 client with explicit credentials
const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION')!,
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
});

// CORS configuration for the S3 bucket
const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['PUT', 'POST', 'DELETE', 'GET'],
      AllowedOrigins: [
        'https://ai-edit.expo.app',
        'http://localhost:3000',
        'http://localhost:19000',
        'http://localhost:19006',
      ],
      ExposeHeaders: ['ETag'],
    },
  ],
};

// Function to update bucket CORS configuration
async function updateBucketCors() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfig,
    });
    await s3Client.send(command);
    console.log('Successfully updated bucket CORS configuration');
  } catch (error) {
    console.error('Error updating bucket CORS:', error);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: 'fileName and fileType are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Update bucket CORS configuration
    await updateBucketCors();

    // Generate unique file name
    const timestamp = Date.now();
    const uniqueFileName = `videos/${timestamp}_${fileName}`;

    // Create presigned URL for upload with explicit ContentType
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Public URL for accessing the file after upload
    const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`;

    return new Response(
      JSON.stringify({
        presignedUrl,
        publicUrl,
        fileName: uniqueFileName,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('S3 upload error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
