import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let sharedSocket: Socket | null = null;

export function useSocket(): Socket | null {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!user) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;

        if (!sharedSocket || !sharedSocket.connected) {
            sharedSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
            });
        }
        setSocket(sharedSocket);

        return () => {
            // Don't disconnect on unmount — socket is shared across components
        };
    }, [user]);

    return socket;
}

export function disconnectSocket() {
    if (sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
    }
}
