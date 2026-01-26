import supabase from './supabase';

export interface UserHackathon {
    id: string;
    user_id: string;
    hackathon_id: string;
    hackathon_name: string;
    hackathon_url?: string;
    platform?: string;
    tags: string[];
    start_date?: string;
    end_date?: string;
    status: 'planned' | 'active' | 'completed';
    progress: number;
    result?: 'winner' | 'finalist' | 'participated';
    created_at?: string;
    updated_at?: string;
}

export interface RegisterHackathonData {
    hackathon_id: string;
    hackathon_name: string;
    hackathon_url?: string;
    platform?: string;
    tags?: string[];
    start_date?: string;
    end_date?: string;
    status?: 'planned' | 'active' | 'completed';
}

/**
 * Get all hackathons for a user
 */
export async function getUserHackathons(userId: string): Promise<UserHackathon[]> {
    if (!supabase || !userId) return [];

    try {
        const { data, error } = await supabase
            .from('user_hackathons')
            .select('id, user_id, hackathon_id, hackathon_name, hackathon_url, platform, tags, start_date, end_date, status, progress, result')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching user hackathons:', error);
            return [];
        }

        return (data || []) as UserHackathon[];
    } catch (error) {
        console.error('Error fetching user hackathons:', error);
        return [];
    }
}

/**
 * Register a user for a hackathon
 */
import { logActivity } from './activityService';

export async function registerForHackathon(
    userId: string,
    hackathon: RegisterHackathonData
): Promise<{ success: boolean; data?: UserHackathon; error?: any }> {
    if (!supabase || !userId) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { data, error } = await supabase
            .from('user_hackathons')
            .insert({
                user_id: userId,
                hackathon_id: hackathon.hackathon_id,
                hackathon_name: hackathon.hackathon_name,
                hackathon_url: hackathon.hackathon_url,
                platform: hackathon.platform,
                tags: hackathon.tags || [],
                start_date: hackathon.start_date,
                end_date: hackathon.end_date,
                status: hackathon.status || 'planned',
                progress: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error registering for hackathon:', error);
            return { success: false, error };
        }

        // Log activity
        // Log activity asynchronously (don't block registration)
        logActivity(
            userId,
            'hackathon_register',
            `Registered for ${hackathon.hackathon_name}`,
            hackathon.hackathon_id
        ).catch(err => console.error('Error logging activity:', err));

        return { success: true, data: data as UserHackathon };
    } catch (error) {
        console.error('Error registering for hackathon:', error);
        return { success: false, error };
    }
}

/**
 * Update a user's hackathon status/progress
 */
export async function updateUserHackathon(
    hackathonId: string,
    updates: Partial<Pick<UserHackathon, 'status' | 'progress' | 'result'>>
): Promise<{ success: boolean; error?: any }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase
            .from('user_hackathons')
            .update(updates)
            .eq('id', hackathonId);

        if (error) {
            console.error('Error updating hackathon:', error);
            return { success: false, error };
        }

        // Log activity based on update type
        // We need userId for logging, but this function doesn't take it. 
        // We can fetch it or just rely on RLS if we had it, but logActivity requires it.
        // For now, we'll skip logging here unless we pass userId or fetch the hackathon owner.
        // Actually, we can fetch the user_id from the hackathon record we just updated or asking caller to pass it.
        // To be safe and quick, I will modify the function signature in a separate step or fetch it now.
        // Let's fetch the hackathon to get user_id
        const { data: hackathon } = await supabase
            .from('user_hackathons')
            .select('user_id, hackathon_name')
            .eq('id', hackathonId)
            .single();

        if (hackathon) {
            let activityType: any = 'hackathon_progress';
            let description = `Updated progress on ${hackathon.hackathon_name}`;

            if (updates.status === 'completed' || updates.result) {
                activityType = 'hackathon_submit';
                description = `Completed ${hackathon.hackathon_name}`;
            }

            await logActivity(hackathon.user_id, activityType, description, hackathonId);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating hackathon:', error);
        return { success: false, error };
    }
}

/**
 * Remove a hackathon from user's list
 */
export async function removeUserHackathon(hackathonId: string): Promise<{ success: boolean; error?: any }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase
            .from('user_hackathons')
            .delete()
            .eq('id', hackathonId);

        if (error) {
            console.error('Error removing hackathon:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Error removing hackathon:', error);
        return { success: false, error };
    }
}

/**
 * Check if user is already registered for a hackathon
 */
export async function isRegisteredForHackathon(userId: string, hackathonId: string): Promise<boolean> {
    if (!supabase || !userId) return false;

    try {
        const { data, error } = await supabase
            .from('user_hackathons')
            .select('id')
            .eq('user_id', userId)
            .eq('hackathon_id', hackathonId)
            .maybeSingle();

        if (error) {
            console.error('Error checking registration:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
}
