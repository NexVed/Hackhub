import express from 'express';
import supabase from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/activities/:userId
 * Get user's activities for the heatmap (past year)
 */
router.get('/:userId', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { userId } = req.params;

    // Calculate date range (past 365 days)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);

    try {
        const { data, error } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

        if (error) throw error;

        // Aggregate activities by date
        const activityMap = {};

        data.forEach(activity => {
            const date = activity.date;
            if (!activityMap[date]) {
                activityMap[date] = {
                    date,
                    activities: [],
                    level: 0
                };
            }
            activityMap[date].activities.push({
                type: activity.activity_type,
                description: activity.description,
                hackathonId: activity.hackathon_id
            });
        });

        // Calculate levels based on activity count and types
        Object.values(activityMap).forEach(day => {
            const activities = day.activities;
            const hasHackathonSubmit = activities.some(a => a.type === 'hackathon_submit');
            const hasHackathonProgress = activities.some(a => a.type === 'hackathon_progress');
            const hasMultipleTypes = new Set(activities.map(a => a.type)).size > 1;

            if (hasMultipleTypes || activities.length >= 3) {
                day.level = 4;
            } else if (hasHackathonSubmit) {
                day.level = 3;
            } else if (hasHackathonProgress || activities.length >= 2) {
                day.level = 2;
            } else if (activities.length >= 1) {
                day.level = 1;
            }

            // Create description
            day.description = activities.map(a => a.description).join(', ');
        });

        res.json({ activities: Object.values(activityMap) });

    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/activities
 * Log a new activity
 */
router.post('/', requireAuth, async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { activityType, description, hackathonId, date } = req.body;
    const userId = req.user.id;

    if (!activityType) {
        return res.status(400).json({ error: 'Activity type is required' });
    }

    try {
        const { data, error } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                activity_type: activityType,
                description: description || getDefaultDescription(activityType),
                hackathon_id: hackathonId || null,
                date: date || new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ activity: data });

    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function for default descriptions
function getDefaultDescription(type) {
    const descriptions = {
        'hackathon_register': 'Registered for hackathon',
        'hackathon_progress': 'Updated project progress',
        'hackathon_submit': 'Submitted project',
        'github_commit': 'GitHub contribution',
        'leetcode_solve': 'Solved coding problem'
    };
    return descriptions[type] || 'Activity logged';
}

export default router;
