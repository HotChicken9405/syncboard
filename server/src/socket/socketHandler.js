import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const boardPresence = new Map(); // boardId → Set of { userId, name }

export function initSocket(io) {

  // Authenticate socket connection
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

    socket.on('board:join', ({ boardId, userName }) => {
      socket.join(boardId);
      socket.currentBoard = boardId;
      socket.userName     = userName;

      // Track presence
      if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Set());
      boardPresence.get(boardId).add({ userId: user.id, name: userName });

      // Broadcast updated presence to everyone in board
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
  io.to(boardId).emit(event, data);
}