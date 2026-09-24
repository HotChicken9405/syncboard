import { request } from './client.js';

export const register    = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login       = (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) });
export const logout      = ()     => request('/auth/logout',   { method: 'POST' });
export const refreshToken = ()    => request('/auth/refresh',  { method: 'POST' });
export const getMe       = ()     => request('/auth/me');
export const updateProfile  = (data) => request('/auth/me',       { method: 'PATCH',  body: JSON.stringify(data) });
export const changePassword = (data) => request('/auth/password', { method: 'PATCH',  body: JSON.stringify(data) });
export const deleteAccount  = ()     => request('/auth/me',       { method: 'DELETE' });