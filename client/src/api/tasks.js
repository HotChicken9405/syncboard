import { mockTasks } from '../data/mockTasks.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTasks = async () => {
  await delay(400);
  return [...mockTasks];
};

export const createTask = async (task) => {
  await delay(400);
  const newTask = { ...task, id: crypto.randomUUID() };
  mockTasks.push(newTask);
  return newTask;
};

export const updateTask = async (id, changes) => {
  await delay(400);
  const index = mockTasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  mockTasks[index] = { ...mockTasks[index], ...changes };
  return mockTasks[index];
};

export const deleteTask = async (id) => {
  await delay(400);
  const index = mockTasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  mockTasks.splice(index, 1);
};