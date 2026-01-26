-- Create a composite index on user_activities(user_id, date) to speed up heatmap queries
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, date);
