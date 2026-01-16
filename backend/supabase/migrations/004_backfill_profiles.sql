-- ============================================
-- Backfill Missing Profiles
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert profile rows for existing users who don't have one
INSERT INTO public.profiles (id, name, username, avatar_url)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
    'user_' || substr(id::text, 1, 8),
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
