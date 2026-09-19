import { request } from './client.js';

const base = (boardId) => `/boards/${boardId}/columns`;

export const getColumns   = (boardId) => request(base(boardId));
export const createColumn = (boardId, data) => request(base(boardId), { method: 'POST', body: JSON.stringify(data) });
export const updateColumn = (boardId, columnId, data) => request(`${base(boardId)}/${columnId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteColumn = (boardId, columnId) => request(`${base(boardId)}/${columnId}`, { method: 'DELETE' });
export const reorderColumns = (boardId, orderedIds) => request(`${base(boardId)}/reorder`, { method: 'POST', body: JSON.stringify({ orderedIds }) });