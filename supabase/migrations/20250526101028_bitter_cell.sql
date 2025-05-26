/*
  # Add audio storage bucket
  
  1. Creates a new storage bucket for audio files
  2. Sets up RLS policies for secure audio file access
  3. Configures file size limits and allowed MIME types
*/

-- Create the audio bucket
select create_storage_bucket(
  'audio',
  false,
  52428800, -- 50MB limit
  array['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a']
);

-- Create upload policy
select create_storage_policy(
  'audio',
  'Users can upload audio files',
  'INSERT',
  null,
  $policy$bucket_id = 'audio' and split_part(name, '/', 2) = auth.uid()::text$policy$
);

-- Create read policy
select create_storage_policy(
  'audio',
  'Users can read own audio files',
  'SELECT',
  $policy$bucket_id = 'audio' and split_part(name, '/', 2) = auth.uid()::text$policy$
);

-- Create delete policy
select create_storage_policy(
  'audio',
  'Users can delete own audio files',
  'DELETE',
  $policy$bucket_id = 'audio' and split_part(name, '/', 2) = auth.uid()::text$policy$
);