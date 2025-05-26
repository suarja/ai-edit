/*
  # Storage Policies for Videos Bucket

  1. Storage Setup
    - Creates videos bucket if it doesn't exist
    - Enables RLS on storage.objects table
  
  2. Storage Policies
    - Upload: Authenticated users can upload to videos bucket
    - Update: Authenticated users can update files in videos bucket
    - Delete: Authenticated users can delete files in videos bucket
    - Read: Public read access for all files in videos bucket
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow uploads to videos bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow update of own files in videos bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow deletion of own files in videos bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read access to videos bucket" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Allow uploads to videos bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

  CREATE POLICY "Allow update of own files in videos bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos');

  CREATE POLICY "Allow deletion of own files in videos bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos');

  CREATE POLICY "Allow public read access to videos bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'videos');
END $$;