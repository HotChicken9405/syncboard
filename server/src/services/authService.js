import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { config } from '../config/config.js';
import { AppError, UnauthorizedError } from '../utils/AppError.js';

export async function register({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, name });

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return { token, user: user.toPublic() };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid email or password');

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return { token, user: user.toPublic() };
}

export async function updateProfile(userId, { name }) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError('User not found');
  user.name = name;
  await user.save();
  return user.toPublic();
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError('User not found');

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function deleteAccount(userId) {
  await Task.deleteMany({ createdBy: userId });
  await Board.deleteMany({ createdBy: userId });
  await User.deleteOne({ _id: userId });
}