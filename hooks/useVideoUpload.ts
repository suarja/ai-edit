import { useState, useCallback } from 'react';
import { VideoAsset } from './useVideoSelector';

export type UploadResult = {
  publicUrl: string;
  s3FileName: string;
};

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToS3 = useCallback(
    async (
      asset: VideoAsset,
      getPresignedUrl: (
        fileName: string,
        fileType: string,
        fileSize?: number
      ) => Promise<{
        presignedUrl: string;
        publicUrl: string;
        s3FileName: string;
      }>
    ): Promise<UploadResult> => {
      setUploading(true);
      setProgress(0);
      try {
        const fileName = asset.fileName || 'video.mp4';
        const fileType = asset.mimeType || 'video/mp4';
        const { presignedUrl, publicUrl, s3FileName } = await getPresignedUrl(
          fileName,
          fileType,
          asset.fileSize
        );
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', presignedUrl);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error('Échec du téléchargement sur S3'));
            }
          };
          xhr.onerror = () => {
            reject(new Error("Erreur réseau lors de l'upload S3"));
          };
          xhr.send(blob);
        });
        setUploading(false);
        setProgress(100);
        return { publicUrl, s3FileName };
      } catch (error) {
        setUploading(false);
        setProgress(0);
        throw error;
      }
    },
    []
  );

  const reset = () => {
    setUploading(false);
    setProgress(0);
  };

  return { uploadToS3, uploading, progress, reset };
}
