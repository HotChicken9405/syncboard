const QUEUE_KEY = 'syncboard_offline';

export function getOfflineQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

export function addToQueue(action) {
  const queue = getOfflineQueue();
  queue.push({ ...action, timestamp: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getCachedTasks(boardId) {
  try { return JSON.parse(localStorage.getItem(`syncboard_tasks_${boardId}`) || '[]'); }
  catch { return []; }
}

export function cacheTasks(boardId, tasks) {
  localStorage.setItem(`syncboard_tasks_${boardId}`, JSON.stringify(tasks));
}