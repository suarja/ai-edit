/*
  # Add render_id to video_requests table

  1. Changes
    - Add render_id column to video_requests table
    - Column is nullable text type
    - No default value
*/

ALTER TABLE video_requests
ADD COLUMN render_id TEXT;