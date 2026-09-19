import { Column } from '../models/Column.js';
import { Task } from '../models/Task.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError.js';

export async function list(boardId) {
  return Column.find({ boardId }).sort({ position: 1, createdAt: 1 });
}

export async function create(boardId, userId, data) {
  const last = await Column.findOne({ boardId }).sort({ position: -1 });
  const position = last ? last.position + 1000 : 0;
  return Column.create({ ...data, boardId, createdBy: userId, position });
}

export async function getOne(columnId, userId) {
  const column = await Column.findById(columnId);
  if (!column) throw new NotFoundError('Column');
  if (column.createdBy.toString() !== userId) throw new ForbiddenError();
  return column;
}

export async function update(columnId, userId, data) {
  const column = await getOne(columnId, userId);
  Object.assign(column, data);
  await column.save();
  return column;
}

export async function remove(columnId, userId) {
  const column = await getOne(columnId, userId);

  // Block deletion if column has tasks
  const taskCount = await Task.countDocuments({ columnId });
  if (taskCount > 0) {
    throw new AppError(
      `Cannot delete column — move or delete the ${taskCount} task${taskCount > 1 ? 's' : ''} first`,
      400,
      'COLUMN_NOT_EMPTY'
    );
  }

  await Column.deleteOne({ _id: columnId });
}

export async function reorder(boardId, userId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    Column.updateOne(
      { _id: id, boardId, createdBy: userId },
      { position: index * 1000 }
    )
  );
  await Promise.all(updates);
}

// Called on board creation — seed default columns
export async function seedDefaults(boardId, userId) {
  const defaults = ['To Do', 'In Progress', 'Done'];
  const columns = await Promise.all(
    defaults.map((name, i) =>
      Column.create({ name, boardId, createdBy: userId, position: i * 1000, color: '#111111' })
    )
  );
  return columns;
}