import { request } from './client.js';

const base = (boardId, taskId) => `/boards/${boardId}/tasks/${taskId}`;

export const getComments = (boardId, taskId) => request(`${base(boardId, taskId)}/comments`);
export const addComment = (boardId, taskId, text) => request(`${base(boardId, taskId)}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
export const deleteComment = (boardId, taskId, commentId) => request(`${base(boardId, taskId)}/comments/${commentId}`, { method: 'DELETE' });
export const getActivity = (boardId, taskId) => request(`${base(boardId, taskId)}/activity`);