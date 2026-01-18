import supabase from './supabase';
import { Hackathon } from '../app/types/hackathon';

// Map database platform names to frontend platform types
const platformMap: Record<string, Hackathon['platform']> = {
    'Unstop': 'Unstop',
    'Devfolio': 'Devfolio',
    'Devnovate': 'Devnovate',
    'Hack2Skill': 'Hack2Skill',
    'HackerEarth': 'HackerEarth',
    'Devpost': 'Devpost',
    'MLH': 'MLH',
    'Other': 'Other',
};

interface ScrapedHackathonRow {
    id: string;
    provider_platform_name: string;
    hackathon_name: string;
    start_date: string | null;
    end_date: string | null;
    status: 'live' | 'upcoming' | 'completed' | null;
    place_region: string | null;
    location: string | null;
    description: string | null;
    direct_link: string | null;
    source_scraped_at: string;
    created_at: string;
}

/**
 * Compute hackathon status based on dates and database status
 */
function computeStatus(
    startDate: string | null,
    endDate: string | null,
    dbStatus: string | null
): Hackathon['status'] {
    const now = new Date();

    if (dbStatus === 'live') return 'live';
    if (dbStatus === 'completed') return 'upcoming'; // Handle completed as past

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) return 'upcoming';
        if (now > end) return 'upcoming'; // Past hackathons shown as upcoming for consistency

        // Check if ending soon (within 3 days)
        const daysUntilEnd = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilEnd <= 3) return 'ending-soon';

        return 'live';
    }

    return dbStatus === 'upcoming' ? 'upcoming' : 'live';
}

/**
 * Generate tags from platform, region, and location
 */
function generateTags(
    platform: string,
    region: string | null,
    location: string | null
): string[] {
    const tags: string[] = [];

    // Add region as tag
    if (region) {
        if (region.toLowerCase() === 'online') {
            tags.push('Online');
        } else if (region.toLowerCase() === 'india') {
            tags.push('India');
        } else if (region.toLowerCase() === 'global') {
            tags.push('Global');
        } else {
            tags.push(region);
        }
    }

    // Add location if different from region
    if (location && location !== region) {
        tags.push(location);
    }

    return tags;
}

/**
 * Map database row to frontend Hackathon interface
 */
function mapToHackathon(row: ScrapedHackathonRow): Hackathon {
    const platform = platformMap[row.provider_platform_name] || 'Other';
    const startDate = row.start_date || new Date().toISOString().split('T')[0];
    const endDate = row.end_date || startDate;

    return {
        id: row.id,
        name: row.hackathon_name,
        startDate,
        endDate,
        platform,
        description: row.description || `Hackathon on ${row.provider_platform_name}`,
        tags: generateTags(row.provider_platform_name, row.place_region, row.location),
        url: row.direct_link || '#',
        status: computeStatus(row.start_date, row.end_date, row.status),
    };
}

/**
 * Fetch all scraped hackathons from the database
 */
export async function getScrapedHackathons(): Promise<Hackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('*')
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching scraped hackathons:', error);
            return [];
        }

        return (data || []).map(mapToHackathon);
    } catch (error) {
        console.error('Error in getScrapedHackathons:', error);
        return [];
    }
}

/**
 * Fetch scraped hackathons by platform
 */
export async function getScrapedHackathonsByPlatform(
    platform: string
): Promise<Hackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('*')
            .eq('provider_platform_name', platform)
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching hackathons by platform:', error);
            return [];
        }

        return (data || []).map(mapToHackathon);
    } catch (error) {
        console.error('Error in getScrapedHackathonsByPlatform:', error);
        return [];
    }
}

/**
 * Fetch hackathons grouped by platform
 */
export async function getHackathonsGroupedByPlatform(): Promise<
    Record<string, Hackathon[]>
> {
    const hackathons = await getScrapedHackathons();

    const grouped: Record<string, Hackathon[]> = {
        Unstop: [],
        Devfolio: [],
        Devnovate: [],
        Hack2Skill: [],
        HackerEarth: [],
        Devpost: [],
        MLH: [],
        Other: [],
    };

    for (const hackathon of hackathons) {
        if (grouped[hackathon.platform]) {
            grouped[hackathon.platform].push(hackathon);
        } else {
            grouped.Other.push(hackathon);
        }
    }

    return grouped;
}

/**
 * Get upcoming and live hackathons only (filter out completed)
 */
export async function getActiveHackathons(): Promise<Hackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('*')
            .in('status', ['live', 'upcoming'])
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching active hackathons:', error);
            return [];
        }

        return (data || []).map(mapToHackathon);
    } catch (error) {
        console.error('Error in getActiveHackathons:', error);
        return [];
    }
}
