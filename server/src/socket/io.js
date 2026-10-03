import { Server } from 'socket.io';

let io;

export function initIO(httpServer, options) {
  io = new Server(httpServer, options);
  return io;
}

export function getIO() {
  return io;
}