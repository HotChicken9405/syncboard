import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

export async function list(userId) {
  return Board.find({ createdBy: userId }).sort({ createdAt: -1 });
}

export async function create(data, userId) {
  return Board.create({ ...data, createdBy: userId });
}

export async function getOne(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) throw new NotFoundError('Board');
  if (board.createdBy.toString() !== userId) throw new ForbiddenError();
  return board;
}

export async function update(boardId, data, userId) {
  const board = await getOne(boardId, userId);
  Object.assign(board, data);
  await board.save();
  return board;
}

export async function remove(boardId, userId) {
  await getOne(boardId, userId);
  await Task.deleteMany({ boardId }); // delete all tasks in board
  await Board.deleteOne({ _id: boardId });
}