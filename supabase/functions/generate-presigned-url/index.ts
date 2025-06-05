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
        // Production web
        'https://ai-edit.expo.app',
        // Mobile app scheme
        'ai-edit://*',
        // Expo development
        'exp://*',
        // Local development
        'http://localhost:*',
        'http://127.0.0.1:*',
        // Development server
        'http://192.168.*.*:*',
        // Allow all - since mobile apps can have dynamic origins
        '*',
      ],
      ExposeHeaders: [
        'ETag',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
      ],
      MaxAgeSeconds: 3600,
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
    'authorization, x-client-info, apikey, content-type, x-client-platform',
  'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    // Check if request is from web or mobile
    const clientPlatform = req.headers.get('x-client-platform');
    const isWeb = clientPlatform === 'web';

    if (req.method === 'POST') {
      // Generate presigned URL
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

      // Generate unique file name
      const timestamp = Date.now();
      const uniqueFileName = `videos/${timestamp}_${fileName}`;

      if (isWeb) {
        // For web, return a URL to this function for PUT requests
        const uploadUrl = new URL(req.url);
        uploadUrl.searchParams.set('key', uniqueFileName);
        uploadUrl.searchParams.set('contentType', fileType);

        return new Response(
          JSON.stringify({
            presignedUrl: uploadUrl.toString(),
            publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`,
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
      } else {
        // For mobile, return S3 presigned URL
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: uniqueFileName,
          ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return new Response(
          JSON.stringify({
            presignedUrl,
            publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`,
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
      }
    } else if (req.method === 'PUT' && isWeb) {
      // Handle web file upload
      const url = new URL(req.url);
      const key = url.searchParams.get('key');
      const contentType = url.searchParams.get('contentType');

      if (!key || !contentType) {
        return new Response(
          JSON.stringify({ error: 'Missing key or contentType parameter' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: await req.blob(),
        ContentType: contentType,
      });

      await s3Client.send(command);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('S3 upload error:', error);

    return new Response(JSON.stringify({ error: 'Failed to handle request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
});
