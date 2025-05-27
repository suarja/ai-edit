import {
  createUploadthing,
  UploadThingError,
  type FileRouter,
} from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/server';
import { supabase } from '@/lib/supabase';

// Create a new instance of UploadThing
const f = createUploadthing();
const token = process.env.UPLOADTHING_TOKEN;

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define a route for video uploads
  videoUploader: f({ video: { maxFileSize: '512MB' } })
    .middleware(async () => {
      // For now, allow uploads without authentication
      // We'll add proper authentication later
      return { userId: 'anonymous' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete', file);
      // Return the file data
      return {
        videoId: file.key,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

// Create API route handlers
const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    token,
  },
});

export { handlers as GET, handlers as POST };
