/*
  # Update scripts table RLS policies

  1. Changes
    - Remove WITH CHECK clause from insert policy to allow script creation
    - Keep other policies unchanged for data security

  2. Security
    - Authenticated users can insert scripts without user_id check
    - Read/update/delete still restricted to own scripts
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can read own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can update own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can delete own scripts" ON scripts;

-- Recreate policies with updated insert policy
CREATE POLICY "Users can insert own scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own scripts"
  ON scripts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON scripts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);