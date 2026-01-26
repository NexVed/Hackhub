-- Remove strict foreign key constraint on hackathon_id
-- We track hackathons from many sources (scrapers), not just the mnc_hackathons table.
-- So we cannot enforce a foreign key to mnc_hackathons.

ALTER TABLE public.user_activities
DROP CONSTRAINT IF EXISTS user_activities_hackathon_id_fkey;

-- If the column was created with implicit constraint name, we might need to find it,
-- but usually dropping by name works if named standardly.
-- If the previous migration used "REFERENCES mnc_hackathons(id)", Postgres generates a name.
-- Usually "user_activities_hackathon_id_fkey".

-- Also ensure the column type is generic TEXT to support various ID formats if needed,
-- originally it was UUID in 014 but TEXT in 003?
-- 003 said "hackathon_id TEXT".
-- 014 said "ADD COLUMN ... UUID REFERENCES ...".
-- If it was TEXT before, 014 might have failed or converted it. 
-- But if it IS UUID, it might fail for non-UUID scraped IDs.
-- Let's change it to TEXT to be safe for any scraper ID.

ALTER TABLE public.user_activities
ALTER COLUMN hackathon_id TYPE TEXT;
