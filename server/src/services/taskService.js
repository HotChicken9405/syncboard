import { Task } from '../models/Task.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError.js';
import { logActivity } from './commentService.js';

export async function list(userId, boardId) {
  return Task.find({ createdBy: userId, boardId }).sort({ position: 1, createdAt: -1 });
}

export async function create(data, userId, boardId, author) {
  const last = await Task.findOne({ createdBy: userId, boardId, columnId: data.columnId })
    .sort({ position: -1 });
  const position = last ? last.position + 1000 : 0;
  const task = await Task.create({ ...data, createdBy: userId, boardId, version: 1, position });
  await logActivity(task._id, boardId, author, 'Created this task');
  return task;
}

export async function getOne(id, userId) {
  const task = await Task.findById(id);
  if (!task) throw new NotFoundError('Task');
  if (task.createdBy.toString() !== userId) throw new ForbiddenError();
  return task;
}

export async function update(id, data, userId, author) {
  const task = await getOne(id, userId);

  if (data.version !== undefined && data.version !== task.version) {
    throw new AppError('Conflict: task was modified by another user', 409, 'CONFLICT');
  }

  if (data.columnId && data.columnId !== task.columnId?.toString()) {
    await logActivity(task._id, task.boardId, author, `Moved to another column`);
  }
  if (data.priority && data.priority !== task.priority) {
    await logActivity(task._id, task.boardId, author, `Changed priority to ${data.priority}`);
  }
  if (data.assignee && data.assignee !== task.assignee) {
    await logActivity(task._id, task.boardId, author, `Reassigned to ${data.assignee}`);
  }
  if (data.description !== undefined && data.description !== task.description) {
    await logActivity(task._id, task.boardId, author, 'Updated description');
  }

  Object.assign(task, data);
  task.version += 1;
  await task.save();
  return task;
}

export async function reorder(boardId, userId, orderedIds) {
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