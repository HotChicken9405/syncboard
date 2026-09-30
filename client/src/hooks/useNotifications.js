import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket/socket.js';
import {
  getNotifications, markRead, markAllRead,
  acceptInvite, declineInvite,
} from '../api/notifications.js';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    getNotifications()
      .then(res => { setNotifications(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Listen for new notifications via socket
  useEffect(() => {
    const handleNew = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };
    socket.on('notify:new', handleNew);
    return () => socket.off('notify:new', handleNew);
  }, []);

  const handleMarkRead = useCallback(async (id) => {
    await markRead(id);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleAccept = useCallback(async (id) => {
    await acceptInvite(id);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, status: 'accepted', read: true } : n)
    );
  }, []);

  const handleDecline = useCallback(async (id) => {
    await declineInvite(id);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, status: 'declined', read: true } : n)
    );
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    accept: handleAccept,
    decline: handleDecline,
  };
}