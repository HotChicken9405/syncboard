import { io } from 'socket.io-client';

const URL = 'http://localhost:4000';

export const socket = io(URL, {
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