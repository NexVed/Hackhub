/**
 * Socket.io Service - Manages WebSocket connections for real-time updates
 */

let io = null;

/**
 * Initialize Socket.io server
 * @param {import('http').Server} httpServer - HTTP server instance
 * @param {string} frontendUrl - Frontend URL for CORS
 */
export function initSocket(httpServer, frontendUrl) {
    const { Server } = require('socket.io');

    io = new Server(httpServer, {
        cors: {
            origin: frontendUrl,
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

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
                console.log(`👤 Socket ${socket.id} left room user:${userId}`);
            }
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`❌ Socket error for ${socket.id}:`, error);
        });
    });

    console.log('✅ Socket.io initialized');
    return io;
}

/**
 * Get the Socket.io instance
 * @returns {import('socket.io').Server}
 * @throws {Error} If Socket.io is not initialized
 */
export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initSocket first.');
    }
    return io;
}

/**
 * Check if Socket.io is initialized
 * @returns {boolean}
 */
export function isSocketInitialized() {
    return io !== null;
}

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Data to emit
 */
export function emitToUser(userId, event, data) {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
}

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Data to emit
 */
export function emitToAll(event, data) {
    if (io) {
        io.emit(event, data);
    }
}

export default { initSocket, getIO, isSocketInitialized, emitToUser, emitToAll };
