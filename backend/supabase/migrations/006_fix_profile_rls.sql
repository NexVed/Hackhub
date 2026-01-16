-- ============================================
-- Fix RLS Policies for Profile Updates
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Self Profile Update" ON profiles;
DROP POLICY IF EXISTS "Self Profile Insert" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (public profiles)
CREATE POLICY "Public profiles" ON profiles 
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Self Profile Insert" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Self Profile Update" ON profiles 
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
