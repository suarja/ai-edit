import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/server';

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  videoUploader: f({ video: { maxFileSize: '512MB' } })
    .middleware(async () => {
      return { userId: 'anonymous' };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        videoId: file.key,
        url: file.ufsUrl,
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
