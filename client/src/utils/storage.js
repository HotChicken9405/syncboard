const STORAGE_KEY = 'syncboard_offline';

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToQueue(action) {
  const queue = getOfflineQueue();
  queue.push({ ...action, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCachedTasks() {
  try {
    return JSON.parse(localStorage.getItem('syncboard_tasks') || '[]');
  } catch {
    return [];
  }
}

export function cacheTasks(tasks) {
  localStorage.setItem('syncboard_tasks', JSON.stringify(tasks));
}

export function isOnline() {
  return navigator.onLine;
}