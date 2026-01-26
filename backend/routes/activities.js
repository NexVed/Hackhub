import express from 'express';
import { createClient } from '@supabase/supabase-js';
import supabase from '../services/supabase.js';
import { cache } from '../services/cacheService.js';
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
    const cacheKey = `activities:${userId}`;

    // Create a scoped client if auth header is present to respect RLS
    // or to bypass RLS if the user is authorized
    const authHeader = req.headers.authorization;
    let queryClient = supabase;

    if (authHeader) {
        queryClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                global: {
                    headers: {
                        Authorization: authHeader
                    }
                }
            }
        );
    }

    try {
        // Try to get from cache first
        // const cachedData = cache.get(cacheKey);
        // if (cachedData) {
        //     console.log(`📦 Cache HIT for activities:${userId}`);
        //     return res.json({ activities: cachedData, cached: true });
        // }

        // console.log(`📦 Cache MISS for activities:${userId}`);

        // Calculate date range (past 365 days)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 365);

        const { data, error } = await queryClient
            .from('user_activities')
            .select('date, activity_type, description, hackathon_id')
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
            const hasHackathonTrack = activities.some(a => a.type === 'hackathon_track'); // Green dot for tracking
            const hasHackathonProgress = activities.some(a => a.type === 'hackathon_progress');
            const hasMultipleTypes = new Set(activities.map(a => a.type)).size > 1;

            if (hasHackathonSubmit || hasMultipleTypes || activities.length >= 4) {
                day.level = 4;
            } else if (activities.length >= 3) {
                day.level = 3;
            } else if (hasHackathonProgress || hasHackathonTrack || activities.length >= 2) {
                day.level = 2; // Level 2 is distinct green
            } else if (activities.length >= 1) {
                day.level = 1;
            }

            // Create description
            day.description = activities.map(a => a.description).join(', ');
        });

        const result = Object.values(activityMap);

        // Cache for 5 minutes
        // cache.set(cacheKey, result, 300);

        res.json({ activities: result, cached: false });

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
    // We need to create a authenticated client for RLS to work
    // The global 'supabase' client is ANON, so it fails RLS checks that require auth.uid()
    const scopedSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
            global: {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        }
    );

    const { activityType, description, hackathonId, date } = req.body;
    const userId = req.user.id;

    if (!activityType) {
        return res.status(400).json({ error: 'Activity type is required' });
    }

    try {
        const { data, error } = await scopedSupabase
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

        // Invalidate cache for this user
        cache.invalidate(`activities:${userId}`);

        // Emit real-time update via Socket.io
        if (req.io) {
            req.io.to(`user:${userId}`).emit('new_activity', data);
            req.io.emit('activity_update', { userId, activity: data });
        }

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
        'hackathon_track': 'Tracked a hackathon',
        'github_commit': 'GitHub contribution',
        'leetcode_solve': 'Solved coding problem',
        'team_create': 'Created a team',
        'team_join': 'Joined a team'
    };
    return descriptions[type] || 'Activity logged';
}

export default router;

