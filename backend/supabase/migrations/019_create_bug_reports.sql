-- Create Bug Reports Table
CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Nullable for anonymous reports if we want, but better to link if logged in
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open',
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create bug reports" ON bug_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bug reports" ON bug_reports FOR SELECT USING (auth.uid() = user_id);
-- In a real app, admins would need a policy to view all.

