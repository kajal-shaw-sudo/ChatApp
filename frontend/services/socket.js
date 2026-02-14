import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => socketInstance;

export const connectSocket = () => {
  if (socketInstance?.connected) return socketInstance;

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return null;
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socketInstance = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  socketInstance.on('connect', () => {
    console.log('✅ Socket connected:', socketInstance.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
    alert('Connection error: ' + error.message);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log('🔌 Socket disconnected manually');
  }
};