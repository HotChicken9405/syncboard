import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { Column } from '../models/Column.js';
import { User } from '../models/User.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError.js';
import { seedDefaults } from './columnService.js';

export async function list(userId) {
  return Board.find({
    $or: [
      { createdBy: userId },
      { 'members.userId': userId },
    ],
  }).sort({ createdAt: -1 });
}

export async function create(data, userId) {
  const board = await Board.create({
    ...data,
    createdBy: userId,
    members: [{ userId, role: 'owner' }],
  });
  await seedDefaults(board._id, userId);
  return board;
}

export async function getOne(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) throw new NotFoundError('Board');
  const isMember = board.createdBy.toString() === userId ||
    board.members.some(m => m.userId.toString() === userId);
  if (!isMember) throw new ForbiddenError();
  return board;
}

export async function update(boardId, data, userId) {
  const board = await getOne(boardId, userId);
  // Only owner can update board settings
  if (board.createdBy.toString() !== userId) throw new ForbiddenError();
  Object.assign(board, data);
  await board.save();
  return board;
}

export async function remove(boardId, userId) {
  const board = await getOne(boardId, userId);
  if (board.createdBy.toString() !== userId) throw new ForbiddenError();
  await Task.deleteMany({ boardId });
  await Column.deleteMany({ boardId });
  await Board.deleteOne({ _id: boardId });
}

export async function invite(boardId, userId, email) {
  const board = await getOne(boardId, userId);
  if (board.createdBy.toString() !== userId) {
    throw new ForbiddenError();
  }

  const invitee = await User.findOne({ email });
  if (!invitee) throw new AppError('No user found with that email', 404, 'NOT_FOUND');

  const alreadyMember = board.members.some(
    m => m.userId.toString() === invitee._id.toString()
  );
  if (alreadyMember) throw new AppError('User is already a member', 409, 'CONFLICT');

  board.members.push({ userId: invitee._id, role: 'member' });
  await board.save();

  return {
    member: {
      userId: invitee._id,
      name:   invitee.name,
      email:  invitee.email,
      role:   'member',
    },
    board,
  };
}

export async function removeMember(boardId, userId, targetUserId) {
  const board = await getOne(boardId, userId);
  if (board.createdBy.toString() !== userId) throw new ForbiddenError();
  if (targetUserId === userId) throw new AppError('Cannot remove yourself as owner', 400, 'BAD_REQUEST');

  board.members = board.members.filter(
    m => m.userId.toString() !== targetUserId
  );
  await board.save();
  return board;
}

export async function getMembers(boardId, userId) {
  const board = await getOne(boardId, userId);
  const userIds = board.members.map(m => m.userId);
  const users   = await User.find({ _id: { $in: userIds } }).select('name email');

  return board.members.map(m => {
    const user = users.find(u => u._id.toString() === m.userId.toString());
    return {
      userId:   m.userId,
      name:     user?.name  || 'Unknown',
      email:    user?.email || '',
      role:     m.role,
      joinedAt: m.joinedAt,
    };
  });
}