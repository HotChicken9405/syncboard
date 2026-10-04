import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export function connectSocket(token) {
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  socket.disconnect();
}