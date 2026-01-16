-- ============================================
-- User Hackathon Registrations Table
-- Tracks user hackathon participation with status
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    hackathon_id TEXT NOT NULL,
    hackathon_name TEXT NOT NULL,
    hackathon_url TEXT,
    platform TEXT,
    tags TEXT[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result TEXT CHECK (result IS NULL OR result IN ('winner', 'finalist', 'participated')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate registrations
    UNIQUE(user_id, hackathon_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_hackathons_user_id ON public.user_hackathons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hackathons_status ON public.user_hackathons(status);

-- Enable Row Level Security
ALTER TABLE public.user_hackathons ENABLE ROW LEVEL SECURITY;

-- Users can view their own hackathons
CREATE POLICY "Users can view own hackathons"
    ON public.user_hackathons FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own hackathons
CREATE POLICY "Users can insert own hackathons"
    ON public.user_hackathons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own hackathons
CREATE POLICY "Users can update own hackathons"
    ON public.user_hackathons FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own hackathons
CREATE POLICY "Users can delete own hackathons"
    ON public.user_hackathons FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_hackathons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_hackathons_updated_at
    BEFORE UPDATE ON public.user_hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_user_hackathons_updated_at();
