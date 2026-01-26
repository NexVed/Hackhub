-- Add hackathon_id column to user_activities table
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS hackathon_id UUID REFERENCES mnc_hackathons(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_hackathon_id ON user_activities(hackathon_id);
