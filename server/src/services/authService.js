import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/config.js';
import { AppError, UnauthorizedError } from '../utils/AppError.js';

export async function register({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409, 'CONFLICT');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, name });

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  return { token, user: user.toPublic() };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  return { token, user: user.toPublic() };
}