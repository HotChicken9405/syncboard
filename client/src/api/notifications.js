import { request } from './client.js';

export const getNotifications = () => request('/notifications');
export const markRead         = (id) => request(`/notifications/${id}/read`, { method: 'PATCH' });
export const markAllRead      = () => request('/notifications/read-all', { method: 'PATCH' });
export const acceptInvite     = (id) => request(`/notifications/${id}/accept`, { method: 'POST' });
export const declineInvite    = (id) => request(`/notifications/${id}/decline`, { method: 'POST' });