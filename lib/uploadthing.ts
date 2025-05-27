import { generateReactHelpers } from '@uploadthing/react';
import { generateClientDropzoneAccept } from 'uploadthing/client';
import type { UploadRouter } from '../app/api/uploadthing+api';

// Generate type-safe helpers for React Native
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UploadRouter>();

export const { accept } = generateClientDropzoneAccept(['videos', 'images']);
