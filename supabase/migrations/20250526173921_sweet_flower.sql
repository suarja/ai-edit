/*
  # Add RL Training Data Table

  1. New Tables
    - `rl_training_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `raw_prompt` (text)
      - `generated_script` (text)
      - `creatomate_template` (jsonb)
      - `video_request_id` (uuid, references video_requests.id)
      - `created_at` (timestamptz)
      - `feedback_score` (integer, null)
      - `feedback_notes` (text, null)
      - `performance_metrics` (jsonb, null)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    
  3. Foreign Keys
    - user_id references users.id
    - video_request_id references video_requests.id
*/

-- Create rl_training_data table
CREATE TABLE IF NOT EXISTS rl_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  raw_prompt text NOT NULL,
  generated_script text NOT NULL,
  creatomate_template jsonb NOT NULL,
  video_request_id uuid REFERENCES video_requests(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  feedback_score integer,
  feedback_notes text,
  performance_metrics jsonb,
  CONSTRAINT valid_feedback_score CHECK (feedback_score >= 1 AND feedback_score <= 5)
);

-- Enable RLS
ALTER TABLE rl_training_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own training data"
  ON rl_training_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training data"
  ON rl_training_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training data"
  ON rl_training_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);