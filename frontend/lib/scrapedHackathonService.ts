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

    return Array.from(new Set(tags));
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Map API response row to frontend Hackathon interface
 */
function mapApiToHackathon(row: any): Hackathon {
    const platform = platformMap[row.platform] || 'Other';
    const startDate = row.startDate || new Date().toISOString().split('T')[0];
    const endDate = row.endDate || startDate;

    return {
        id: row.id,
        name: row.name,
        startDate,
        endDate,
        platform,
        description: row.description || `Hackathon on ${row.platform}`,
        tags: generateTags(row.platform, row.region, row.location),
        url: row.url || '#',
        status: computeStatus(row.startDate, row.endDate, row.status),
    };
}

/**
 * Fetch all scraped hackathons - uses backend API for caching
 * Falls back to direct Supabase query if API fails
 */
export async function getScrapedHackathons(
    page: number = 0,
    pageSize: number = 20
): Promise<Hackathon[]> {
    try {
        // Try backend API first (has caching)
        const response = await fetch(
            `${API_BASE_URL}/api/hackathons/scraped?page=${page}&limit=${pageSize}`,
            { next: { revalidate: 300 } } // 5 min cache for Next.js
        );

        if (response.ok) {
            const data = await response.json();
            return (data.hackathons || []).map(mapApiToHackathon);
        }
    } catch (error) {
        console.warn('API fetch failed, falling back to Supabase:', error);
    }

    // Fallback to direct Supabase query
    return getScrapedHackathonsFromSupabase(page, pageSize);
}

/**
 * Fallback: Fetch directly from Supabase
 */
async function getScrapedHackathonsFromSupabase(
    page: number = 0,
    pageSize: number = 20
): Promise<Hackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('*')
            .or(`end_date.gte.${cutoffDateStr},end_date.is.null,status.eq.upcoming,status.eq.live`)
            .order('start_date', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Error fetching scraped hackathons:', error);
            return [];
        }

        return (data || []).map(mapToHackathon);
    } catch (error) {
        console.error('Error in getScrapedHackathonsFromSupabase:', error);
        return [];
    }
}


/**
 * Fetch scraped hackathons by platform - uses backend API for caching
 */
export async function getScrapedHackathonsByPlatform(
    platform: string,
    page: number = 0,
    pageSize: number = 20
): Promise<Hackathon[]> {
    try {
        // Try backend API first (has caching)
        const response = await fetch(
            `${API_BASE_URL}/api/hackathons/scraped?platform=${platform}&page=${page}&limit=${pageSize}`,
            { next: { revalidate: 300 } }
        );

        if (response.ok) {
            const data = await response.json();
            return (data.hackathons || []).map(mapApiToHackathon);
        }
    } catch (error) {
        console.warn('API fetch failed, falling back to Supabase:', error);
    }

    // Fallback to direct Supabase query
    return getScrapedHackathonsByPlatformFromSupabase(platform, page, pageSize);
}

/**
 * Fetch overview of hackathons (top 5 from each platform)
 * Guarantees all sections are populated on first load
 */
export async function getScrapedHackathonsOverview(): Promise<Record<string, Hackathon[]>> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/hackathons/scraped/overview`,
            { next: { revalidate: 300 } }
        );

        if (response.ok) {
            const data = await response.json();
            const overviewRaw = data.overview || {};

            const overviewStrings: Record<string, Hackathon[]> = {};

            // Map the raw objects to Hackathon type
            Object.keys(overviewRaw).forEach(key => {
                overviewStrings[key] = (overviewRaw[key] || []).map(mapApiToHackathon);
            });

            // Only return if we have actual data
            if (Object.keys(overviewStrings).length > 0) {
                return overviewStrings;
            }
        }
    } catch (error) {
        console.warn('API fetch overview failed:', error);
    }

    // Fallback: Fetch directly from Supabase
    return getScrapedHackathonsOverviewFromSupabase();
}

/**
 * Fallback: Fetch overview directly from Supabase
 */
async function getScrapedHackathonsOverviewFromSupabase(): Promise<Record<string, Hackathon[]>> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return {};
    }

    const platforms = ['Unstop', 'Devfolio', 'Devnovate', 'Hack2Skill', 'HackerEarth', 'Devpost', 'MLH'];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 2);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const overview: Record<string, Hackathon[]> = {};

    try {
        // Fetch top 5 from each platform in parallel
        const queries = platforms.map(async (platform) => {
            const { data } = await supabase!
                .from('scraped_hackathons')
                .select('*')
                .eq('provider_platform_name', platform)
                .or(`end_date.gte.${cutoffDateStr},end_date.is.null,status.eq.upcoming,status.eq.live`)
                .order('start_date', { ascending: true })
                .limit(5);

            return { platform, hackathons: (data || []).map(mapToHackathon) };
        });

        const results = await Promise.all(queries);

        results.forEach(result => {
            overview[result.platform] = result.hackathons;
        });

        return overview;
    } catch (error) {
        console.error('Error fetching overview from Supabase:', error);
        return {};
    }
}

/**
 * Fallback: Fetch by platform directly from Supabase
 */
async function getScrapedHackathonsByPlatformFromSupabase(
    platform: string,
    page: number = 0,
    pageSize: number = 20
): Promise<Hackathon[]> {
    if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('*')
            .eq('provider_platform_name', platform)
            .or(`end_date.gte.${cutoffDateStr},end_date.is.null`)
            .order('start_date', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Error fetching hackathons by platform:', error);
            return [];
        }

        return (data || []).map(mapToHackathon);
    } catch (error) {
        console.error('Error in getScrapedHackathonsByPlatformFromSupabase:', error);
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
