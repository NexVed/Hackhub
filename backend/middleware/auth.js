import supabase from '../services/supabase.js';

/**
 * Middleware to require authentication
 * Expects Authorization header with Bearer token
 */
export const requireAuth = async (req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server misconfiguration: Supabase not initialized' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        // Attach user to request object for use in route handlers
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

export default { requireAuth };
