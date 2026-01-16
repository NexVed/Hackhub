import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activities.js';
import hackathonRoutes from './routes/hackathons.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'HackHub Backend is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            activities: '/api/activities',
            hackathons: '/api/hackathons'
        }
    });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Activity Routes
app.use('/api/activities', activityRoutes);

// Hackathon Routes
app.use('/api/hackathons', hackathonRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Frontend URL: ${FRONTEND_URL}`);
});
