import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// POST /api/bugs
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, priority, screenshot_url } = req.body;
        const userId = req.user.id; // From requireAuth middleware

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const { data, error } = await supabase
            .from('bug_reports')
            .insert({
                user_id: userId,
                title,
                description,
                priority: priority || 'Medium',
                screenshot_url
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating bug report:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
