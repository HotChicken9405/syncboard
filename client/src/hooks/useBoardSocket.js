import { useEffect, useRef } from 'react';
import { socket } from '../socket/socket.js';
import { getAccessToken } from '../api/client.js';

export function useBoardSocket(boardId, userName, handlers) {
  const handlersRef = useRef(handlers);
  const userNameRef = useRef(userName);

  useEffect(() => {
    handlersRef.current = handlers;
    userNameRef.current = userName;
  });

  useEffect(() => {
    if (!boardId) return;

    const token = getAccessToken();
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    socket.emit('board:join', { boardId, userName: userNameRef.current });

    const wrappedHandlers = {};
    Object.keys(handlersRef.current).forEach(event => {
      wrappedHandlers[event] = (...args) => handlersRef.current[event]?.(...args);
      socket.on(event, wrappedHandlers[event]);
    });

    return () => {
      socket.emit('board:leave', { boardId });
      Object.keys(wrappedHandlers).forEach(event => {
        socket.off(event, wrappedHandlers[event]);
      });
      // Do NOT disconnect — keep socket alive for personal room notifications
    };
  }, [boardId]);
}