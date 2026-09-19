import { useReducer, useEffect, useCallback, useState } from 'react';
import { tasksReducer, initialState } from '../reducers/tasksReducer.js';
import * as api from '../api/tasks.js';
import { getCachedTasks, cacheTasks, getOfflineQueue, addToQueue, clearQueue } from '../utils/storage.js';

export function useTasks(boardId) {
  const [state, dispatch] = useReducer(tasksReducer, {
    ...initialState,
    tasks: getCachedTasks(boardId),
  });
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const checkOnline = async () => {
      try {
        await fetch('http://localhost:4000/api/health', { method: 'HEAD', mode: 'no-cors' });
        setOnline(true);
      } catch { setOnline(false); }
    };
    checkOnline();
    const interval = setInterval(checkOnline, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!boardId) return;
    if (!online) {
      dispatch({ type: 'loaded', tasks: getCachedTasks(boardId) });
      return;
    }
    api.getTasks(boardId)
      .then(res => {
        dispatch({ type: 'loaded', tasks: res.data });
        cacheTasks(boardId, res.data);
      })
      .catch(err => dispatch({ type: 'error', error: err.message }));
  }, [online, boardId]);

  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    for (const action of queue) {
      try {
        if (action.type === 'added')   await api.createTask(action.boardId, action.task);
        if (action.type === 'moved')   await api.updateTask(action.boardId, action.id, { columnId: action.columnId, version: action.version });
        if (action.type === 'deleted') await api.deleteTask(action.boardId, action.id);
      } catch (err) {
        if (err.message.includes('Conflict')) alert(`Conflict for "${action.task?.title || action.id}"`);
      }
    }
    clearQueue();
    const res = await api.getTasks(boardId);
    dispatch({ type: 'loaded', tasks: res.data });
    cacheTasks(boardId, res.data);
  }, [boardId]);

  useEffect(() => {
    if (online) syncOfflineQueue();
  }, [online, syncOfflineQueue]);

  const addTask = useCallback((task) => {
    if (!online) {
      const tempTask = { ...task, _id: 'temp-' + Date.now(), version: 1 };
      addToQueue({ type: 'added', boardId, task });
      dispatch({ type: 'added', task: tempTask });
      cacheTasks(boardId, [...state.tasks, tempTask]);
      return;
    }
    api.createTask(boardId, task)
      .then(res => {
        dispatch({ type: 'added', task: res.data });
        cacheTasks(boardId, [...state.tasks, res.data]);
      })
      .catch(err => alert(err.message));
  }, [online, boardId, state.tasks]);

  const moveTask = useCallback((id, columnId, currentVersion) => {
    if (!online) {
      addToQueue({ type: 'moved', boardId, id, columnId, version: currentVersion });
      dispatch({ type: 'moved', id, columnId });
      cacheTasks(boardId, state.tasks.map(t => (t._id || t.id) === id ? { ...t, columnId } : t));
      return;
    }
    api.updateTask(boardId, id, { columnId, version: currentVersion })
      .then(res => {
        dispatch({ type: 'moved', id, columnId: res.data.columnId, version: res.data.version });
        cacheTasks(boardId, state.tasks.map(t => (t._id || t.id) === id ? res.data : t));
      })
      .catch(err => {
        if (err.message.includes('Conflict')) alert('Task was modified by another user. Refresh to see latest.');
        else alert(err.message);
      });
  }, [online, boardId, state.tasks]);

  const removeTask = useCallback((id) => {
    if (!window.confirm('Delete this task?')) return;
    if (!online) {
      addToQueue({ type: 'deleted', boardId, id });
      dispatch({ type: 'deleted', id });
      cacheTasks(boardId, state.tasks.filter(t => (t._id || t.id) !== id));
      return;
    }
    api.deleteTask(boardId, id)
      .then(() => {
        dispatch({ type: 'deleted', id });
        cacheTasks(boardId, state.tasks.filter(t => (t._id || t.id) !== id));
      })
      .catch(err => alert(err.message));
  }, [online, boardId, state.tasks]);

  return { state, dispatch, addTask, moveTask, removeTask, online };
}