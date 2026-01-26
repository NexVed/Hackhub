-- Add indexes to improve Teams page performance

-- Teams table indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_status_public ON public.teams(status, is_public);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at DESC);

-- Team Members table indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
-- Composite index for checking membership efficiently
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON public.team_members(team_id, user_id);

-- Team Requests table indexes
CREATE INDEX IF NOT EXISTS idx_team_requests_team_id ON public.team_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_user_id ON public.team_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_status ON public.team_requests(status);
-- Composite index for checking specific request status
CREATE INDEX IF NOT EXISTS idx_team_requests_team_user_status ON public.team_requests(team_id, user_id, status);