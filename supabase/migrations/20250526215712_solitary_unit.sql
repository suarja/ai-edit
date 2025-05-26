-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
);

-- Allow public read access
CREATE POLICY "Public read access for videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');