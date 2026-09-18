import { Task } from '../models/Task.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError.js';

export async function list(userId, boardId) {
  return Task.find({ createdBy: userId, boardId }).sort({ position: 1, createdAt: -1 });
}

export async function create(data, userId, boardId) {
  // Put new tasks at the end of their column
  const last = await Task.findOne({ createdBy: userId, boardId, status: data.status || 'todo' })
    .sort({ position: -1 });
  const position = last ? last.position + 1000 : 0;
  return Task.create({ ...data, createdBy: userId, boardId, version: 1, position });
}

export async function getOne(id, userId) {
  const task = await Task.findById(id);
  if (!task) throw new NotFoundError('Task');
  if (task.createdBy.toString() !== userId) throw new ForbiddenError();
  return task;
}

export async function update(id, data, userId) {
  const task = await getOne(id, userId);
  if (data.version !== undefined && data.version !== task.version) {
    throw new AppError('Conflict: task was modified by another user', 409, 'CONFLICT');
  }
  Object.assign(task, data);
  task.version += 1;
  await task.save();
  return task;
}

export async function reorder(boardId, userId, orderedIds) {
  // orderedIds = array of task IDs in new order
  const updates = orderedIds.map((id, index) =>
    Task.updateOne(
      { _id: id, createdBy: userId, boardId },
      { position: index * 1000 }
    )
  );
  await Promise.all(updates);
}

export async function remove(id, userId) {
  await getOne(id, userId);
  await Task.deleteOne({ _id: id });
}