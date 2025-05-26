/*
  # Add RLS policies for scripts table

  1. Security
    - Enable RLS on scripts table
    - Add policies for:
      - Users can insert their own scripts
      - Users can read their own scripts
      - Users can update their own scripts
      - Users can delete their own scripts

  2. Changes
    - Enable RLS
    - Add CRUD policies
*/

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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