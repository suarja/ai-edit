-- Create script_drafts table for script chat functionality
-- This extends the existing scripts table without modifying it

CREATE TABLE IF NOT EXISTS script_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouveau Script',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'used')),
  current_script TEXT NOT NULL DEFAULT '',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  output_language TEXT NOT NULL DEFAULT 'fr',
  editorial_profile_id UUID REFERENCES editorial_profiles(id) ON DELETE SET NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  estimated_duration REAL NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_script_drafts_user_id ON script_drafts(user_id);
CREATE INDEX idx_script_drafts_status ON script_drafts(status);
CREATE INDEX idx_script_drafts_updated_at ON script_drafts(updated_at DESC);
CREATE INDEX idx_script_drafts_user_status ON script_drafts(user_id, status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_script_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_script_drafts_updated_at
  BEFORE UPDATE ON script_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_script_drafts_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE script_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using Clerk authentication
CREATE POLICY "Users can view their own script drafts"
  ON script_drafts FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  );

CREATE POLICY "Users can create their own script drafts"
  ON script_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  );

CREATE POLICY "Users can update their own script drafts"
  ON script_drafts FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  );

CREATE POLICY "Users can delete their own script drafts"
  ON script_drafts FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  );

-- Add index on JSONB messages field for better performance on conversation queries
CREATE INDEX idx_script_drafts_messages_gin ON script_drafts USING GIN (messages);

-- Comment on table and important columns
COMMENT ON TABLE script_drafts IS 'Stores script drafts with conversation history for script chat feature';
COMMENT ON COLUMN script_drafts.messages IS 'JSONB array of chat messages with role, content, timestamp, and metadata';
COMMENT ON COLUMN script_drafts.current_script IS 'Latest version of the script extracted from conversation';
COMMENT ON COLUMN script_drafts.status IS 'draft: work in progress, validated: ready for video generation, used: script has been used for video';
COMMENT ON COLUMN script_drafts.version IS 'Incremented on each update for optimistic concurrency control';

-- Create function for safe JSONB message appending
CREATE OR REPLACE FUNCTION append_script_draft_messages(
  draft_id UUID,
  new_messages JSONB
) RETURNS script_drafts AS $$
DECLARE
  result script_drafts;
BEGIN
  UPDATE script_drafts 
  SET 
    messages = messages || new_messages,
    message_count = message_count + jsonb_array_length(new_messages),
    version = version + 1,
    updated_at = NOW()
  WHERE id = draft_id 
    AND user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_user_id = (SELECT (auth.jwt() ->> 'sub'::text))
    )
  RETURNING * INTO result;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Script draft not found or access denied';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION append_script_draft_messages(UUID, JSONB) TO authenticated; 