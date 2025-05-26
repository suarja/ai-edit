-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;

-- Create storage bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to upload files
CREATE POLICY "Allow uploads to videos bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
);

-- Allow owners to update their files
CREATE POLICY "Allow update of own files in videos bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'videos');

-- Allow owners to delete their files
CREATE POLICY "Allow deletion of own files in videos bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- Allow public read access to all files in the videos bucket
CREATE POLICY "Allow public read access to videos bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');