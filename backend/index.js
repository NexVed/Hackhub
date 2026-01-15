import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend
    credentials: true
}));
app.use(express.json());

// Supabase Setup
// Note: These will be undefined until you create a .env file with these variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('⚠️ Supabase URL or Key missing. Auth endpoints will fail.');
}

// Routes
app.get('/', (req, res) => {
    res.send('HackHub Backend is running');
});

// Auth Routes
app.post('/api/auth/:provider', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server misconfiguration: Supabase not initialized' });
    }

    const { provider } = req.params;

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: 'http://localhost:3000/dashboard', // Redirect back to frontend dashboard after login
            },
        });

        if (error) throw error;

        // Return the OAuth URL to the frontend
        res.json({ url: data.url });

    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
