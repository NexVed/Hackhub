import supabase from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type ActivityType =
    | 'hackathon_register'
    | 'hackathon_progress'
    | 'hackathon_submit'
    | 'hackathon_track'
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
 * Uses backend API for caching
 */
export async function getUserActivities(userId: string): Promise<ActivityDay[]> {
    try {
        if (!supabase) return [];
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {};
        if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`${API_URL}/api/activities/${userId}`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }

        const data = await response.json();

        if (data.cached) {
            console.log('Using cached activity data');
        }

        return data.activities as ActivityDay[];
    } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to empty or mock if needed, but for now return empty
        return [];
    }
}

/**
 * Log a new activity
 * Uses backend API to ensure cache invalidation
 */
export async function logActivity(
    userId: string,
    activityType: ActivityType,
    description?: string,
    hackathonId?: string,
    date: string = new Date().toISOString().split('T')[0]
): Promise<boolean> {

    try {
        if (!supabase) throw new Error('Supabase not initialized');

        // Get current session token for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn('No active session for logging activity');
            return false;
        }

        const response = await fetch(`${API_URL}/api/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                activityType,
                description,
                hackathonId,
                date
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to log activity');
        }

        return true;
    } catch (error: any) {
        console.error('Error logging activity:', error?.message || error);
        return false;
    }
}

function getDefaultDescription(type: ActivityType): string {
    const descriptions: Record<ActivityType, string> = {
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
