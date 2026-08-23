import { useReducer, useEffect, useCallback, useState } from 'react';
import { tasksReducer, initialState } from '../reducers/tasksReducer.js';
import * as api from '../api/tasks.js';
import { getCachedTasks, cacheTasks, getOfflineQueue, addToQueue, clearQueue } from '../utils/storage.js';

export function useTasks() {
    const [state, dispatch] = useReducer(tasksReducer, { ...initialState, tasks: getCachedTasks() });
  const [online, setOnline] = useState(true);

  // Check actual server connectivity every 5 seconds
  useEffect(() => {
    const checkOnline = async () => {
      try {
        await fetch('http://localhost:4000/api/health', { method: 'HEAD', mode: 'no-cors' });
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };

    checkOnline();
    const interval = setInterval(checkOnline, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!online) {
      dispatch({ type: 'loaded', tasks: getCachedTasks() });
      return;
    }

    api.getTasks()
      .then(res => {
        dispatch({ type: 'loaded', tasks: res.data });
        cacheTasks(res.data);
      })
      .catch(err => dispatch({ type: 'error', error: err.message }));
  }, [online]);

  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    for (const action of queue) {
      try {
        if (action.type === 'added') {
          await api.createTask(action.task);
        } else if (action.type === 'moved') {
          await api.updateTask(action.id, { status: action.status, version: action.version });
        } else if (action.type === 'deleted') {
          await api.deleteTask(action.id);
        }
      } catch (err) {
        if (err.message.includes('Conflict')) {
          alert(`Conflict detected. Your changes for "${action.task?.title || action.id}" were overwritten.`);
        }
      }
    }
    clearQueue();
    
    const res = await api.getTasks();
    dispatch({ type: 'loaded', tasks: res.data });
    cacheTasks(res.data);
  }, []);

  useEffect(() => {
    if (online) {
      syncOfflineQueue();
    }
  }, [online, syncOfflineQueue]);

  const addTask = useCallback((task) => {
    if (!online) {
      const tempTask = { ...task, _id: 'temp-' + Date.now(), version: 1 };
      addToQueue({ type: 'added', task });
      dispatch({ type: 'added', task: tempTask });
      cacheTasks([...state.tasks, tempTask]);
      return;
    }

    api.createTask(task)
      .then(res => {
        dispatch({ type: 'added', task: res.data });
        cacheTasks([...state.tasks, res.data]);
      })
      .catch(err => alert(err.message));
  }, [online, state.tasks]);

  const moveTask = useCallback((id, status, currentVersion) => {
    if (!online) {
      addToQueue({ type: 'moved', id, status, version: currentVersion });
      dispatch({ type: 'moved', id, status });
      cacheTasks(state.tasks.map(t => (t._id || t.id) === id ? { ...t, status } : t));
      return;
    }

    api.updateTask(id, { status, version: currentVersion })
      .then(res => {
        dispatch({ type: 'moved', id, status: res.data.status, version: res.data.version });
        cacheTasks(state.tasks.map(t => (t._id || t.id) === id ? res.data : t));
      })
      .catch(err => {
        if (err.message.includes('Conflict')) {
          alert('This task was modified by another user. Refresh to see the latest version.');
        } else {
          alert(err.message);
        }
      });
  }, [online, state.tasks]);

  const removeTask = useCallback((id) => {
    if (!window.confirm('Delete this task?')) return;
    
    if (!online) {
      addToQueue({ type: 'deleted', id });
      dispatch({ type: 'deleted', id });
      cacheTasks(state.tasks.filter(t => (t._id || t.id) !== id));
      return;
    }

    api.deleteTask(id)
      .then(() => {
        dispatch({ type: 'deleted', id });
        cacheTasks(state.tasks.filter(t => (t._id || t.id) !== id));
      })
      .catch(err => alert(err.message));
  }, [online, state.tasks]);

  return { state, addTask, moveTask, removeTask, online };
}