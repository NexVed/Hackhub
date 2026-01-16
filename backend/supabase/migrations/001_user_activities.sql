-- Create user_activities table for tracking heatmap activities
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'hackathon_register',
    'hackathon_progress', 
    'hackathon_submit',
    'github_commit',
    'leetcode_solve'
  )),
  description TEXT,
  hackathon_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date 
ON user_activities(user_id, date);

-- Enable Row Level Security
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activities
CREATE POLICY "Users can read own activities"
ON user_activities FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own activities
CREATE POLICY "Users can insert own activities"
ON user_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own activities
CREATE POLICY "Users can delete own activities"
ON user_activities FOR DELETE
USING (auth.uid() = user_id);
