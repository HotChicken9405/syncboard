import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { config } from '../config/config.js';
import { AppError, UnauthorizedError } from '../utils/AppError.js';

const ACCESS_TOKEN_EXPIRY  = '15m';
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

async function generateRefreshToken(userId) {
  const token     = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  await RefreshToken.create({ token, userId, expiresAt });
  return token;
}

export async function register({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(password, 12);
  const user         = await User.create({ email, passwordHash, name });

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return { accessToken, refreshToken, user: user.toPublic() };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid email or password');

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return { accessToken, refreshToken, user: user.toPublic() };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw new UnauthorizedError('No refresh token');

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await RefreshToken.deleteOne({ _id: stored._id });
    throw new UnauthorizedError('Refresh token expired or invalid');
  }

  const user = await User.findById(stored.userId);
  if (!user) throw new UnauthorizedError('User not found');

  // Rotate refresh token — delete old, issue new
  await RefreshToken.deleteOne({ _id: stored._id });
  const newAccessToken  = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user._id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: user.toPublic() };
}

export async function logout(refreshToken) {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
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

  // Invalidate all refresh tokens on password change
  await RefreshToken.deleteMany({ userId });
}

export async function deleteAccount(userId) {
  await Task.deleteMany({ createdBy: userId });
  await Board.deleteMany({ createdBy: userId });
  await RefreshToken.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
}