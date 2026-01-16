-- ============================================
-- Add Missing Profile Fields
-- Run this in Supabase SQL Editor to ensure schema matches frontend
-- ============================================

-- Safely add columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS institute TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_github TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN DEFAULT FALSE;

-- Ensure username has a UNIQUE constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
    ) THEN
        -- Check if there are duplicates before adding constraint
        -- If duplicates exist, this might fail, so manual cleanup would be needed.
        -- But for now we try to add it.
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        NULL; -- Handle race condition
END $$;
