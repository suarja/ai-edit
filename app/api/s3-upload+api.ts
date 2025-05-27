import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = 'ai-edit-v1';

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return Response.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const timestamp = Date.now();
    const uniqueFileName = `videos/${timestamp}_${fileName}`;

    // Create presigned URL for upload
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

    return Response.json({
      presignedUrl,
      publicUrl,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    return Response.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
