import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

interface Props { children: ReactNode; }

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: Props) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5002', {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    });

    newSocket.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used inside SocketProvider');
  return context;
};