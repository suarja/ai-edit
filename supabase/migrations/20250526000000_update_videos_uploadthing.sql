-- Update videos table for UploadThing integration
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS fileKey text,
    ADD COLUMN IF NOT EXISTS size_bytes bigint,
    ADD COLUMN IF NOT EXISTS mime_type text,
    ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'uploadthing';
-- Migrate existing records to use UploadThing as provider
UPDATE public.videos
SET storage_provider = 'uploadthing'
WHERE storage_provider IS NULL;