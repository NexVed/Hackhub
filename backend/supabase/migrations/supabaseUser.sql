-- ============================================
-- HackHub Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    headline TEXT, -- Short tagline
    institute TEXT, -- [NEW]
    course TEXT, -- [NEW]
    year TEXT, -- [NEW] e.g., "3rd Year", "2026"
    gender TEXT, -- [NEW]
    mobile TEXT, -- [NEW]
    skills TEXT[] DEFAULT '{}', -- Global skills list
    resume_url TEXT, -- For applying to teams
    social_github TEXT,
    social_linkedin TEXT,
    social_twitter TEXT,
    social_instagram TEXT,
    social_threads TEXT,
    is_profile_completed BOOLEAN DEFAULT FALSE, -- [NEW] Flag for redirect logic
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- 2. HACKATHONS
-- ============================================
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('Unstop', 'Devfolio', 'Devnovate', 'Hack2Skill', 'HackerEarth', 'Devpost', 'MLH', 'Other')),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'live', 'ending-soon', 'ended')),
    is_flagship BOOLEAN DEFAULT FALSE,
    organizer TEXT,
    logo_url TEXT,
    timeline TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);

-- ============================================
-- 3. TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'active', 'completed')),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    looking_for TEXT[] DEFAULT '{}', -- [NEW] Skills looking for
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TEAM MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- ============================================
-- 5. PROJECTS [NEW]
-- Projects created by users/teams
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    thumbnail_url TEXT,
    demo_url TEXT,
    repo_url TEXT,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- If solo project
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. USER HACKATHONS (Participation)
-- ============================================
CREATE TABLE IF NOT EXISTS user_hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    user_status TEXT NOT NULL DEFAULT 'planned' CHECK (user_status IN ('planned', 'active', 'submitted', 'completed')),
    progress INTEGER DEFAULT 0,
    notes TEXT,
    result TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- [NEW] Link to project
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hackathon_id)
);

-- ============================================
-- 7. NOTIFICATIONS [NEW]
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('team_invite', 'team_request', 'hackathon_reminder', 'badge_earned', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. USER ACTIVITIES (Heatmap)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. USER SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT TRUE,
    hackathon_reminders BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (Simplified)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public projects" ON projects FOR SELECT USING (true);

-- User-specific Policies
CREATE POLICY "Self Profile Update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "My Notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "My Activities" ON user_activities FOR ALL USING (auth.uid() = user_id);

-- Team Policies (simplified)
CREATE POLICY "Team Creation" ON teams FOR INSERT WITH CHECK (auth.uid() = owner_id);

