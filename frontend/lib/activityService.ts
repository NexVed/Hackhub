import supabase from './supabase';

export type ActivityType =
    | 'hackathon_register'
    | 'hackathon_progress'
    | 'hackathon_submit'
    | 'github_commit'
    | 'leetcode_solve'
    | 'team_create'
    | 'team_join';

export interface Activity {
    id: string;
    userId: string;
    date: string;
    activityType: ActivityType;
    description: string;
    hackathonId?: string;
}

export interface ActivityDay {
    date: string;
    level: 0 | 1 | 2 | 3 | 4;
    description?: string;
    activities: {
        type: ActivityType;
        description: string;
    }[];
}

/**
 * Fetch user's activities for the heatmap
 */
export async function getUserActivities(userId: string): Promise<ActivityDay[]> {
    if (!supabase) {
        console.warn('Supabase not initialized, using mock data');
        return generateMockActivities();
    }

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

        if (error) {
            console.warn('Could not fetch activities (using mock data):', error.message || error);
            return generateMockActivities();
        }

        console.log('Fetched activities from DB:', data?.length);
        return aggregateActivities(data || []);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return generateMockActivities();
    }
}

/**
 * Log a new activity
 */
export async function logActivity(
    userId: string,
    activityType: ActivityType,
    description?: string,
    hackathonId?: string,
    date?: string
): Promise<boolean> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return false;
    }

    try {
        const { error } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                activity_type: activityType,
                description: description || getDefaultDescription(activityType),
                hackathon_id: hackathonId || null,
                date: date || new Date().toISOString().split('T')[0]
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
}

/**
 * Aggregate raw activities into day-level data for heatmap
 */
function aggregateActivities(rawActivities: any[]): ActivityDay[] {
    const activityMap: Record<string, ActivityDay> = {};

    rawActivities.forEach(activity => {
        const date = activity.date;
        if (!activityMap[date]) {
            activityMap[date] = {
                date,
                level: 0,
                activities: [],
                description: ''
            };
        }
        activityMap[date].activities.push({
            type: activity.activity_type,
            description: activity.description
        });
    });

    // Calculate levels
    Object.values(activityMap).forEach(day => {
        const activities = day.activities;
        const hasSubmit = activities.some(a => a.type === 'hackathon_submit');
        const hasProgress = activities.some(a => a.type === 'hackathon_progress');
        const uniqueTypes = new Set(activities.map(a => a.type)).size;

        if (uniqueTypes >= 3 || activities.length >= 4) {
            day.level = 4;
        } else if (hasSubmit || uniqueTypes >= 2 || activities.some(a => a.type === 'team_create')) {
            day.level = 3;
        } else if (hasProgress || activities.length >= 2 || activities.some(a => a.type === 'team_join')) {
            day.level = 2;
        } else if (activities.length >= 1) {
            day.level = 1;
        }

        day.description = activities.map(a => a.description).join(' • ');
    });

    return Object.values(activityMap);
}

/**
 * Generate mock activities for demo/fallback
 */
function generateMockActivities(): ActivityDay[] {
    const activities: ActivityDay[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);

    const descriptions = [
        'Registered for hackathon',
        'Updated project progress',
        'Submitted project',
        'GitHub contribution',
        'Solved coding problem',
    ];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const rand = Math.random();

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (rand > 0.7) level = 1;
        if (rand > 0.85) level = 2;
        if (rand > 0.92) level = 3;
        if (rand > 0.97) level = 4;

        if (level > 0) {
            activities.push({
                date: dateStr,
                level,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                activities: []
            });
        }
    }

    return activities;
}

function getDefaultDescription(type: ActivityType): string {
    const descriptions: Record<ActivityType, string> = {
        'hackathon_register': 'Registered for hackathon',
        'hackathon_progress': 'Updated project progress',
        'hackathon_submit': 'Submitted project',
        'github_commit': 'GitHub contribution',
        'leetcode_solve': 'Solved coding problem',
        'team_create': 'Created a team',
        'team_join': 'Joined a team'
    };
    return descriptions[type] || 'Activity logged';
}
