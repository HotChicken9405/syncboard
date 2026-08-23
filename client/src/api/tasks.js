import { request } from './client.js';

export const getTasks = () => request('/tasks');
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, changes) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });