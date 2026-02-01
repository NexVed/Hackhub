import supabase from './supabase';

export interface MNCHackathon {
    id: string;
    name: string;
    organizer: string;
    logoUrl: string;
    timeline: string;
    status: 'upcoming' | 'open' | 'live' | 'ended';
    url: string;
    description: string;
    eligibility?: string;
    focusAreas: string[];
    perks?: string;
    selectionProcess?: string;
    techStack: string[];
    startDate: string;
    endDate: string;
    registrationStart?: string;
    registrationEnd?: string;
    isFlagship: boolean;
    isMNC: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Fetch all MNC hackathons from the backend API
 */
export async function getMNCHackathons(): Promise<MNCHackathon[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/hackathons/mnc`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.hackathons || [];
    } catch (error) {
        console.warn('Failed to fetch from API, trying Supabase directly:', error);
        return getMNCHackathonsFromSupabase();
    }
}

/**
 * Fetch hackathons for calendar display
 */
export async function getCalendarHackathons(): Promise<MNCHackathon[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/hackathons/calendar`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.hackathons || [];
    } catch (error) {
        console.warn('Failed to fetch calendar hackathons:', error);
        return getMNCHackathonsFromSupabase();
    }
}

/**
 * Fetch a single hackathon by ID
 */
export async function getHackathonById(id: string): Promise<MNCHackathon | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/hackathons/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.hackathon || null;
    } catch (error) {
        console.error('Failed to fetch hackathon:', error);
        return null;
    }
}

/**
 * Fallback: Fetch MNC hackathons directly from Supabase
 */
async function getMNCHackathonsFromSupabase(): Promise<MNCHackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('mnc_hackathons')
            .select('*')
            .eq('is_flagship', true)
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            organizer: row.organizer,
            logoUrl: row.logo_url,
            timeline: row.timeline,
            status: row.status,
            url: row.url,
            description: row.description,
            eligibility: row.eligibility,
            focusAreas: row.focus_areas || [],
            perks: row.perks,
            selectionProcess: row.selection_process,
            techStack: row.tech_stack || [],
            startDate: row.start_date,
            endDate: row.end_date,
            registrationStart: row.registration_start,
            registrationEnd: row.registration_end,
            isFlagship: row.is_flagship,
            isMNC: true
        }));
    } catch (error) {
        console.error('Error fetching from Supabase:', error);
        return [];
    }
}
