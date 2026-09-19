import { request } from './client.js';

const base = (boardId) => `/boards/${boardId}/tasks`;

export const getTasks     = (boardId) => request(base(boardId));
export const createTask   = (boardId, task) => request(base(boardId), { method: 'POST', body: JSON.stringify(task) });
export const updateTask   = (boardId, id, changes) => request(`${base(boardId)}/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteTask   = (boardId, id) => request(`${base(boardId)}/${id}`, { method: 'DELETE' });
export const reorderTasks = (boardId, orderedIds) => request(`${base(boardId)}/reorder`, { method: 'POST', body: JSON.stringify({ orderedIds }) });