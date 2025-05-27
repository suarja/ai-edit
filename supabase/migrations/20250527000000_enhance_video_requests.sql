-- Add additional columns to video_requests table for more detailed render information
ALTER TABLE public.video_requests
ADD COLUMN IF NOT EXISTS render_snapshot_url TEXT,
    ADD COLUMN IF NOT EXISTS render_duration FLOAT,
    ADD COLUMN IF NOT EXISTS render_width INTEGER,
    ADD COLUMN IF NOT EXISTS render_height INTEGER,
    ADD COLUMN IF NOT EXISTS render_error TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS video_requests_render_status_idx ON public.video_requests (render_status);
-- Comment on columns
COMMENT ON COLUMN public.video_requests.render_snapshot_url IS 'URL to the thumbnail image of the rendered video';
COMMENT ON COLUMN public.video_requests.render_duration IS 'Duration of the rendered video in seconds';
COMMENT ON COLUMN public.video_requests.render_width IS 'Width of the rendered video in pixels';
COMMENT ON COLUMN public.video_requests.render_height IS 'Height of the rendered video in pixels';
COMMENT ON COLUMN public.video_requests.render_error IS 'Error message if render failed';
COMMENT ON COLUMN public.video_requests.updated_at IS 'Last update timestamp';