import express from 'express';
import supabase from '../services/supabase.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * POST /api/auth/:provider
 * Initiate OAuth flow with specified provider (google, github)
 */
router.post('/:provider', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server misconfiguration: Supabase not initialized' });
    }

    const { provider } = req.params;
    const validProviders = ['google', 'github'];

    if (!validProviders.includes(provider)) {
        return res.status(400).json({ error: `Invalid provider. Supported: ${validProviders.join(', ')}` });
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${FRONTEND_URL}/auth/callback`,
            },
        });

        if (error) throw error;

        // Return the OAuth URL to the frontend
        res.json({ url: data.url });

    } catch (error) {
        console.error('OAuth initiation error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/auth/session
 * Get current user session (for debugging/verification)
 */
router.get('/session', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server misconfiguration: Supabase not initialized' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ user: null, session: null });
    }

    const token = authHeader.substring(7);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.json({ user: null, session: null });
        }

        res.json({ user });
    } catch (error) {
        console.error('Session check error:', error);
        res.json({ user: null, session: null });
    }
});

/**
 * POST /api/auth/logout
 * Log out user (invalidate session on server - for completeness)
 */
router.post('/logout', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server misconfiguration: Supabase not initialized' });
    }

    // Note: Most of the logout logic happens on the frontend with Supabase client
    // This endpoint is for any server-side cleanup if needed
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
