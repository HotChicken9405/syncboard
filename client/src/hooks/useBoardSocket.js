import { useEffect, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../socket/socket.js';
import { getAccessToken } from '../api/client.js';

export function useBoardSocket(boardId, userName, handlers) {
  const handlersRef = useRef(handlers);
  const userNameRef = useRef(userName);

  // Keep refs current without re-running effect
  useEffect(() => {
    handlersRef.current = handlers;
    userNameRef.current = userName;
  });

  useEffect(() => {
    if (!boardId) return;

    const token = getAccessToken();
    connectSocket(token);

    socket.emit('board:join', { boardId, userName: userNameRef.current });

    // Wrap handlers so they always use latest version
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
      disconnectSocket();
    };
  }, [boardId]); // boardId is the only true dependency
}