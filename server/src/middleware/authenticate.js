import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { UnauthorizedError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    next(new UnauthorizedError(expired ? 'Token expired' : 'Invalid token'));
  }
}