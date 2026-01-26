import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activities.js';
import hackathonRoutes from './routes/hackathons.js';
import { initSocket } from './services/socketService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join user-specific room for targeted updates
    socket.on('join_user', (userId) => {
        if (userId) {
            socket.join(`user:${userId}`);
            console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
        }
    });

    // Leave user room
    socket.on('leave_user', (userId) => {
        if (userId) {
            socket.leave(`user:${userId}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
});

// Store io instance for use in routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Attach io to request for easy access in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'HackHub Backend is running',
        version: '1.0.0',
        websocket: 'enabled',
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
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        websocket: io ? 'connected' : 'disconnected',
        connectedClients: io?.engine?.clientsCount || 0
    });
});

// Start Server with Socket.io
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Frontend URL: ${FRONTEND_URL}`);
    console.log(`⚡ WebSocket server is ready`);
});
