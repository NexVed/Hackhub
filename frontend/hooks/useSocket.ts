'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface UseSocketOptions {
    userId?: string;
    autoConnect?: boolean;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    lastPing: number | null;
    connect: () => void;
    disconnect: () => void;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
}

/**
 * React hook for managing WebSocket connections
 * Provides real-time updates from the backend
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
    const { userId, autoConnect = true } = options;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastPing, setLastPing] = useState<number | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Initialize socket connection
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Socket connected:', newSocket.id);
            setIsConnected(true);

            // Join user-specific room if userId is provided
            if (userId) {
                newSocket.emit('join_user', userId);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Ping-pong for latency measurement
        newSocket.on('pong', () => {
            setLastPing(Date.now());
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    }, [userId]);

    // Disconnect socket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            if (userId) {
                socketRef.current.emit('leave_user', userId);
            }
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, [userId]);

    // Emit event
    const emit = useCallback((event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }, []);

    // Subscribe to event
    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        socketRef.current?.on(event, callback);
    }, []);

    // Unsubscribe from event
    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        if (callback) {
            socketRef.current?.off(event, callback);
        } else {
            socketRef.current?.off(event);
        }
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // Update user room when userId changes
    useEffect(() => {
        if (socketRef.current?.connected && userId) {
            socketRef.current.emit('join_user', userId);
        }
    }, [userId]);

    return {
        socket,
        isConnected,
        lastPing,
        connect,
        disconnect,
        emit,
        on,
        off,
    };
}

export default useSocket;
