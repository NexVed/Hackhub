import express from 'express';
import supabase from '../services/supabase.js';

const router = express.Router();

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

    try {
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

        res.json({ hackathons });

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

    try {
        const { data, error } = await supabase
            .from('mnc_hackathons')
            .select('*')
            .eq('is_flagship', true)
            .order('start_date', { ascending: true });

        if (error) throw error;

        const hackathons = data.map(transformHackathon);

        res.json({ hackathons });

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

    try {
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

        res.json({ hackathons });

    } catch (error) {
        console.error('Error fetching calendar hackathons:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/hackathons/:id
 * Get a single hackathon by ID
 */
router.get('/:id', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { id } = req.params;

    try {
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

        res.json({ hackathon: transformHackathon(data) });

    } catch (error) {
        console.error('Error fetching hackathon:', error);
        res.status(500).json({ error: error.message });
    }
});

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
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export default router;
