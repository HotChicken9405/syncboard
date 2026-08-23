import { Task } from '../models/Task.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

export async function list(userId) {
  return Task.find({ createdBy: userId }).sort({ createdAt: -1 });
}

export async function create(data, userId) {
  return Task.create({ ...data, createdBy: userId });
}

export async function getOne(id, userId) {
  const task = await Task.findById(id);
  if (!task) throw new NotFoundError('Task');
  if (task.createdBy.toString() !== userId) throw new ForbiddenError();
  return task;
}

export async function update(id, data, userId) {
  const task = await getOne(id, userId);
  Object.assign(task, data);
  await task.save();
  return task;
}

export async function remove(id, userId) {
  const task = await getOne(id, userId);
  await Task.deleteOne({ _id: id });
}