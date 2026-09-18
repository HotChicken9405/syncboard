import { request } from './client.js';

export const getTasks = (boardId) => request(`/boards/${boardId}/tasks`);
export const createTask = (boardId, task) => request(`/boards/${boardId}/tasks`, { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (boardId, id, changes) => request(`/boards/${boardId}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteTask = (boardId, id) => request(`/boards/${boardId}/tasks/${id}`, { method: 'DELETE' });
export const reorderTasks = (boardId, orderedIds) => request(`/boards/${boardId}/tasks/reorder`, { method: 'POST', body: JSON.stringify({ orderedIds }) });