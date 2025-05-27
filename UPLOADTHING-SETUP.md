# UploadThing Setup for AI-Edit

## Dependencies

Install the required packages:

```bash
npm install uploadthing @uploadthing/expo expo-image-picker expo-document-picker
```

## Environment Variables

Add the following environment variables to your `.env` file:

```
# UploadThing Configuration
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
EXPO_PUBLIC_SERVER_URL=https://your-app-url.com
```

## Configuration

1. Sign up for an UploadThing account at [uploadthing.com](https://uploadthing.com)
2. Create a new app and get your secret key and app ID
3. Configure your app to allow video uploads with public access

## Implementation

The integration consists of:

1. API Route (`app/api/uploadthing+api.ts`): Handles file uploads and authentication
2. Utility Hooks (`lib/uploadthing.ts`): Provides type-safe hooks for file selection
3. VideoUploader Component (`components/VideoUploader.tsx`): UI for video uploads

## Usage in Application

Use the VideoUploader component in your screens:

```tsx
import VideoUploader from '@/components/VideoUploader';

// In your component
<VideoUploader
  onUploadComplete={(data) => {
    console.log('Video uploaded:', data.url);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
/>;
```

## Database Schema

Videos are stored in the `videos` table with the following fields:

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key referencing public.users.id)
- `title`: text (File name)
- `upload_url`: text (Public UploadThing URL)
- `storage_path`: text (UploadThing file key)
- `file_size_bytes`: number
- `mime_type`: text
- `status`: text (Default 'ready')

## Public Access

UploadThing files are publicly accessible by default, which is required for Creatomate integration.
The generate API endpoint (`app/api/videos/generate+api.ts`) uses these public URLs directly.
