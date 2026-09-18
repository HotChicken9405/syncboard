import { Comment } from '../models/Comment.js';
import { Activity } from '../models/Activity.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

export async function listComments(taskId) {
  return Comment.find({ taskId }).sort({ createdAt: 1 });
}

export async function addComment(taskId, boardId, author, text) {
  return Comment.create({ taskId, boardId, author, text });
}

export async function deleteComment(commentId, userId) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.author.id.toString() !== userId) throw new ForbiddenError();
  await Comment.deleteOne({ _id: commentId });
}

export async function listActivity(taskId) {
  return Activity.find({ taskId }).sort({ createdAt: 1 });
}

export async function logActivity(taskId, boardId, author, action) {
  return Activity.create({ taskId, boardId, author, action });
}