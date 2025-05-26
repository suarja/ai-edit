/*
  # Add storage path to videos table
  
  1. Changes
    - Add storage_path column to videos table
    - Make upload_url nullable (for backward compatibility)
    
  2. Notes
    - storage_path will be used to generate upload_url when needed
    - This allows for more reliable video access
*/

ALTER TABLE videos
ADD COLUMN storage_path TEXT;

-- Make upload_url nullable for backward compatibility
ALTER TABLE videos
ALTER COLUMN upload_url DROP NOT NULL;