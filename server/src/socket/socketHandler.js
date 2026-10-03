import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const boardPresence = new Map();

export function initSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      socket.user = { id: payload.sub, email: payload.email };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    // Each user joins their own personal room for notifications
    socket.join(`user:${user.id}`);

    socket.on('board:join', ({ boardId, userName }) => {
      socket.join(boardId);
      socket.currentBoard = boardId;
      socket.userName     = userName;

      if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Set());
      boardPresence.get(boardId).add({ userId: user.id, name: userName });

      io.to(boardId).emit('board:presence', [...boardPresence.get(boardId)]);
    });

    socket.on('board:leave', ({ boardId }) => {
      leaveBoard(socket, boardId, io);
    });

    socket.on('disconnect', () => {
      if (socket.currentBoard) {
        leaveBoard(socket, socket.currentBoard, io);
      }
    });
  });
}

function leaveBoard(socket, boardId, io) {
  socket.leave(boardId);
  const presence = boardPresence.get(boardId);
  if (presence) {
    presence.forEach(u => {
      if (u.userId === socket.user.id) presence.delete(u);
    });
    if (presence.size === 0) {
      boardPresence.delete(boardId);
    } else {
      io.to(boardId).emit('board:presence', [...presence]);
    }
  }
}

export function emitToBoard(io, boardId, event, data) {
  if (!io) return;
  io.to(boardId).emit(event, data);
}

export function emitToUser(io, userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}