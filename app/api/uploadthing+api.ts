import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/server';

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  videoUploader: f({
    video: { maxFileSize: '512MB' },
    'video/quicktime': { maxFileSize: '512MB' },
    'video/mp4': { maxFileSize: '512MB' },
  })
    .middleware(async ({ req }) => {
      return { userId: 'anonymous' };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('Upload complete:', file.name, file.size, 'bytes');

      return {
        videoId: file.key,
        url: file.url,
      };
    }),
};

export type UploadRouter = typeof uploadRouter;

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

export { handlers as GET, handlers as POST };
