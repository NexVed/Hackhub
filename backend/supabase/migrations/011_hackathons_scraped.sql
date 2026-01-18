-- Migration: Create scraped_hackathons table for scraped hackathon data
-- Description: Stores hackathon data from n8n scraper workflow

-- Create the scraped_hackathons table for scraped data
CREATE TABLE IF NOT EXISTS scraped_hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_platform_name TEXT NOT NULL,
    hackathon_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('live', 'upcoming', 'completed')),
    place_region TEXT,
    location TEXT,
    description TEXT,
    direct_link TEXT UNIQUE,
    source_scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scraped_hackathons_provider ON scraped_hackathons(provider_platform_name);
CREATE INDEX IF NOT EXISTS idx_scraped_hackathons_status ON scraped_hackathons(status);
CREATE INDEX IF NOT EXISTS idx_scraped_hackathons_dates ON scraped_hackathons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_scraped_hackathons_region ON scraped_hackathons(place_region);
CREATE INDEX IF NOT EXISTS idx_scraped_hackathons_direct_link ON scraped_hackathons(direct_link);

-- Enable Row Level Security
ALTER TABLE scraped_hackathons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (hackathons are public info)
CREATE POLICY "Allow public read access to scraped_hackathons"
    ON scraped_hackathons
    FOR SELECT
    USING (true);

-- Create policy to allow service role to insert/update (for n8n scraper)
CREATE POLICY "Allow service role to insert scraped_hackathons"
    ON scraped_hackathons
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow service role to update scraped_hackathons"
    ON scraped_hackathons
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Also allow anon key to upsert for n8n workflow (if using anon key)
CREATE POLICY "Allow anon to insert scraped_hackathons"
    ON scraped_hackathons
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon to update scraped_hackathons"
    ON scraped_hackathons
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Grant access to roles
GRANT ALL ON scraped_hackathons TO service_role;
GRANT SELECT, INSERT, UPDATE ON scraped_hackathons TO anon;
GRANT SELECT ON scraped_hackathons TO authenticated;

-- Create a function to update source_scraped_at on update
CREATE OR REPLACE FUNCTION update_scraped_hackathons_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.source_scraped_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating scraped_at timestamp
CREATE TRIGGER update_scraped_hackathons_timestamp
    BEFORE UPDATE ON scraped_hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_scraped_hackathons_at();

COMMENT ON TABLE scraped_hackathons IS 'Scraped hackathon data from multiple platforms via n8n workflow';
COMMENT ON COLUMN scraped_hackathons.provider_platform_name IS 'Source platform: Unstop, HackerEarth, Devnovate, Devfolio, Hack2Skill, Devpost, MLH, or Other';
COMMENT ON COLUMN scraped_hackathons.status IS 'Current status: live, upcoming, or completed';
COMMENT ON COLUMN scraped_hackathons.place_region IS 'Region: online, india, global, or specific city/state';
COMMENT ON COLUMN scraped_hackathons.direct_link IS 'Unique URL to hackathon page (used for deduplication)';
