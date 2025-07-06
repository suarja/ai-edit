/*
 # Add Video Analysis Fields to Videos Table
 
 1. Changes
 - Add analysis_status column to track analysis state
 - Add analysis_data column to store Gemini analysis results
 - Add analysis_error column for error tracking
 - Add analysis_completed_at column for timestamps
 
 2. Purpose
 - Enable automatic video analysis with Gemini AI
 - Store segmentation and metadata analysis results
 - Track analysis progress and errors
 */
-- Add analysis fields to videos table
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'pending' CHECK (
        analysis_status IN ('pending', 'analyzing', 'completed', 'failed')
    ),
    ADD COLUMN IF NOT EXISTS analysis_data jsonb,
    ADD COLUMN IF NOT EXISTS analysis_error text,
    ADD COLUMN IF NOT EXISTS analysis_completed_at timestamptz;
-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_videos_analysis_status ON public.videos(analysis_status);
CREATE INDEX IF NOT EXISTS idx_videos_user_analysis ON public.videos(user_id, analysis_status);
CREATE INDEX IF NOT EXISTS idx_videos_analysis_completed ON public.videos(analysis_completed_at);
-- Add comment for documentation
COMMENT ON COLUMN public.videos.analysis_status IS 'Status of automatic video analysis: pending, analyzing, completed, failed';
COMMENT ON COLUMN public.videos.analysis_data IS 'JSON data from Gemini AI analysis including segments, structure, and metadata';
COMMENT ON COLUMN public.videos.analysis_error IS 'Error message if analysis failed';
COMMENT ON COLUMN public.videos.analysis_completed_at IS 'Timestamp when analysis was completed';