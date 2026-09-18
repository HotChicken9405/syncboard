import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.js';
import { UnauthorizedError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('name email');
    if (!user) return next(new UnauthorizedError('User not found'));
    req.user = { id: payload.sub, email: user.email, name: user.name };
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    next(new UnauthorizedError(expired ? 'Token expired' : 'Invalid token'));
  }
}