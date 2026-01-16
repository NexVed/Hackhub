-- ============================================
-- Create User Activities Table
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 4),
    hackathon_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, date);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON user_activities;
CREATE POLICY "Users can insert own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);
