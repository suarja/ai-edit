-- Cleanup migration for script_drafts - Remove unnecessary complexity
-- This removes over-engineered features and keeps only what's needed

-- Drop the complex append function - we'll use simple UPDATE queries instead
DROP FUNCTION IF EXISTS append_script_draft_messages(UUID, JSONB);

-- Drop redundant indexes (keep only the essential ones)
DROP INDEX IF EXISTS idx_script_drafts_user_status; -- Redundant with individual indexes
DROP INDEX IF EXISTS idx_script_drafts_messages_gin; -- JSONB queries are rare, PostgreSQL can handle without index

-- Keep only essential indexes:
-- idx_script_drafts_user_id (for user filtering)
-- idx_script_drafts_status (for status filtering) 
-- idx_script_drafts_updated_at (for ordering)

-- Simplify the update trigger function (keep it simple)
CREATE OR REPLACE FUNCTION update_script_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update comments to reflect simplified approach
COMMENT ON TABLE script_drafts IS 'Script drafts with conversation history for script chat feature - simplified implementation';
COMMENT ON COLUMN script_drafts.messages IS 'JSONB array of chat messages - use simple UPDATE queries to modify';
COMMENT ON COLUMN script_drafts.version IS 'Version counter for optimistic updates';

-- That's it! Much cleaner and simpler. 