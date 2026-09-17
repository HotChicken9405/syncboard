import { request } from './client.js';

export const getBoards = () => request('/boards');
export const createBoard = (data) => request('/boards', { method: 'POST', body: JSON.stringify(data) });
export const updateBoard = (id, data) => request(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteBoard = (id) => request(`/boards/${id}`, { method: 'DELETE' });