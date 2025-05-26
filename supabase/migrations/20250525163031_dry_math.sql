/*
  # Add Insert Policy for Users Table

  1. Changes
    - Add RLS policy to allow users to insert their own records during sign-up
    - Policy ensures users can only create records with their own auth ID

  2. Security
    - Policy uses auth.uid() to verify user ownership
    - Prevents users from creating records for other users
*/

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);