import express from 'express';
import supabase from '../services/supabase.js';
import { cache } from '../services/cacheService.js';

const router = express.Router();

// Cache TTL constants (in seconds)
const CACHE_TTL = {
    LIST: 300,      // 5 minutes for lists
    SINGLE: 600,    // 10 minutes for single items
    CALENDAR: 300   // 5 minutes for calendar
};

/**
 * Transform database row from snake_case to camelCase
 */
function transformHackathon(row) {
    return {
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
        isMNC: true,
        platform: row.platform || 'Other',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Transform scraped hackathon row to frontend format
 */
function transformScrapedHackathon(row) {
    return {
        id: row.id,
        name: row.hackathon_name,
        platform: row.provider_platform_name || 'Other',
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status || 'upcoming',
        description: row.description || `Hackathon on ${row.provider_platform_name}`,
        url: row.direct_link || '#',
        location: row.location,
        region: row.place_region,
        scrapedAt: row.source_scraped_at
    };
}

/**
 * GET /api/hackathons
 * Get all hackathons (both MNC and regular)
 * Query params:
 *   - status: filter by status (upcoming, open, live, ended)
 *   - flagship: filter flagship hackathons only (true/false)
 */
router.get('/', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { status, flagship } = req.query;
    const cacheKey = `hackathons:list:${status || 'all'}:${flagship || 'all'}`;

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ hackathons: cachedData, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        let query = supabase
            .from('mnc_hackathons')
            .select('*')
            .order('start_date', { ascending: true });

        if (status) {
            query = query.eq('status', status);
        }

        if (flagship === 'true') {
            query = query.eq('is_flagship', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform snake_case to camelCase for frontend compatibility
        const hackathons = data.map(transformHackathon);

        // Cache the result
        cache.set(cacheKey, hackathons, CACHE_TTL.LIST);

        res.json({ hackathons, cached: false });

    } catch (error) {
        console.error('Error fetching hackathons:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/mnc
 * Get only MNC hackathons (flagship hackathons from top companies)
 */
router.get('/mnc', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const cacheKey = 'hackathons:mnc';

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ hackathons: cachedData, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        const { data, error } = await supabase
            .from('mnc_hackathons')
            .select('*')
            .eq('is_flagship', true)
            .order('start_date', { ascending: true });

        if (error) throw error;

        const hackathons = data.map(transformHackathon);

        // Cache the result
        cache.set(cacheKey, hackathons, CACHE_TTL.LIST);

        res.json({ hackathons, cached: false });

    } catch (error) {
        console.error('Error fetching MNC hackathons:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/calendar
 * Get hackathons formatted for calendar display
 * Returns only essential fields needed for calendar rendering
 */
router.get('/calendar', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { year, month } = req.query;
    const cacheKey = `hackathons:calendar:${year || 'all'}:${month || 'all'}`;

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ hackathons: cachedData, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        let query = supabase
            .from('mnc_hackathons')
            .select('id, name, organizer, logo_url, status, start_date, end_date, url, description, is_flagship')
            .order('start_date', { ascending: true });

        // Optionally filter by year/month for calendar view
        if (year && month) {
            const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
            const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

            query = query
                .or(`start_date.gte.${startOfMonth},end_date.gte.${startOfMonth}`)
                .or(`start_date.lte.${endOfMonth},end_date.lte.${endOfMonth}`);
        }

        const { data, error } = await query;

        if (error) throw error;

        const hackathons = data.map(h => ({
            id: h.id,
            name: h.name,
            organizer: h.organizer,
            logoUrl: h.logo_url,
            status: h.status,
            startDate: h.start_date,
            endDate: h.end_date,
            url: h.url,
            description: h.description,
            isFlagship: h.is_flagship,
            isMNC: true // Mark as MNC hackathon
        }));

        // Cache the result
        cache.set(cacheKey, hackathons, CACHE_TTL.CALENDAR);

        res.json({ hackathons, cached: false });

    } catch (error) {
        console.error('Error fetching calendar hackathons:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/scraped
 * Get all scraped hackathons from multiple platforms with caching
 * Query params:
 *   - platform: filter by platform (Unstop, Devfolio, HackerEarth, etc.)
 *   - page: pagination page number (default: 0)
 *   - limit: items per page (default: 20)
 */
router.get('/scraped', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { platform, page = 0, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 0;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 50); // Cap at 50
    const cacheKey = `hackathons:scraped:${platform || 'all'}:${pageNum}:${limitNum}`;

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ hackathons: cachedData.hackathons, total: cachedData.total, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        // Calculate date range - only show hackathons not ended more than 30 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        const from = pageNum * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
            .from('scraped_hackathons')
            .select('*')
            .or(`end_date.gte.${cutoffDateStr},end_date.is.null,status.eq.upcoming,status.eq.live`)
            // Order by start_date to show upcoming events first, mixing platforms
            .order('start_date', { ascending: true })
            .range(from, to);

        if (platform) {
            query = query.eq('provider_platform_name', platform);
        }

        const { data, error } = await query;

        if (error) throw error;

        const hackathons = (data || []).map(transformScrapedHackathon);

        // Cache the result for 5 minutes
        cache.set(cacheKey, { hackathons }, CACHE_TTL.LIST);

        res.json({ hackathons, cached: false });

    } catch (error) {
        console.error('Error fetching scraped hackathons:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/scraped/overview
 * Get top 5 upcoming hackathons for EACH platform in parallel
 * ensuring that the dashboard is fully populated on first load
 */
router.get('/scraped/overview', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const cacheKey = 'hackathons:scraped:overview';

    try {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ overview: cachedData, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        const platforms = [
            'Unstop', 'Devfolio', 'Devnovate', 'Hack2Skill',
            'HackerEarth', 'Devpost', 'MLH'
        ];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 2); // Show recent
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        // Create parallel queries for each platform
        const queries = platforms.map(async (platform) => {
            const { data } = await supabase
                .from('scraped_hackathons')
                .select('*')
                .eq('provider_platform_name', platform)
                .or(`end_date.gte.${cutoffDateStr},end_date.is.null,status.eq.upcoming,status.eq.live`)
                .order('start_date', { ascending: true })
                .limit(5);

            return {
                platform,
                hackathons: (data || []).map(transformScrapedHackathon)
            };
        });

        // Also get 'Other' (platforms not in the main list)
        const otherQuery = (async () => {
            const { data } = await supabase
                .from('scraped_hackathons')
                .select('*')
                .not('provider_platform_name', 'in', `(${platforms.join(',')})`)
                .or(`end_date.gte.${cutoffDateStr},end_date.is.null,status.eq.upcoming,status.eq.live`)
                .order('start_date', { ascending: true })
                .limit(5);

            return {
                platform: 'Other',
                hackathons: (data || []).map(transformScrapedHackathon)
            };
        })();

        queries.push(otherQuery);

        const results = await Promise.all(queries);

        // Convert array to map: { Unstop: [...], Devfolio: [...] }
        const overview = {};
        results.forEach(result => {
            overview[result.platform] = result.hackathons;
        });

        cache.set(cacheKey, overview, CACHE_TTL.LIST);

        res.json({ overview, cached: false });

    } catch (error) {
        console.error('Error fetching hackathon overview:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/scraped/platforms
 * Get list of available platforms with counts
 */
router.get('/scraped/platforms', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const cacheKey = 'hackathons:scraped:platforms';

    try {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json({ platforms: cachedData, cached: true });
        }

        const { data, error } = await supabase
            .from('scraped_hackathons')
            .select('provider_platform_name')
            .not('provider_platform_name', 'is', null);

        if (error) throw error;

        // Count hackathons by platform
        const counts = {};
        data.forEach(row => {
            const platform = row.provider_platform_name;
            counts[platform] = (counts[platform] || 0) + 1;
        });

        const platforms = Object.entries(counts).map(([name, count]) => ({ name, count }));

        cache.set(cacheKey, platforms, CACHE_TTL.LIST);

        res.json({ platforms, cached: false });

    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/:id
 * Get a single hackathon by ID
 * NOTE: This route MUST be defined AFTER all specific routes like /mnc, /calendar, /scraped
 */
router.get('/:id', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { id } = req.params;
    const cacheKey = `hackathons:single:${id}`;

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache HIT: ${cacheKey}`);
            return res.json({ hackathon: cachedData, cached: true });
        }

        console.log(`📦 Cache MISS: ${cacheKey}`);

        const { data, error } = await supabase
            .from('mnc_hackathons')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Hackathon not found' });
            }
            throw error;
        }

        const hackathon = transformHackathon(data);

        // Cache the result
        cache.set(cacheKey, hackathon, CACHE_TTL.SINGLE);

        res.json({ hackathon, cached: false });

    } catch (error) {
        console.error('Error fetching hackathon:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
