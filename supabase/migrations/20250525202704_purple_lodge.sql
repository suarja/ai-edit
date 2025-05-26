/*
  # Add MOV format support
  
  1. Changes
    - Add video/mov MIME type to allowed formats for videos bucket
    - Update existing bucket configuration
*/

-- Update the videos bucket to include MOV format
UPDATE storage.buckets
SET allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/mov']
WHERE id = 'videos';