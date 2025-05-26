/*
  # Create storage bucket for avatars

  1. New Storage Bucket
    - Creates a new public bucket named 'avatars' for storing user profile pictures
  
  2. Security
    - Enables public access to the bucket
    - Adds policy for authenticated users to upload their own avatars
*/

-- Create the avatars bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Create policy to allow public to read avatar files
CREATE POLICY "Allow public to read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');