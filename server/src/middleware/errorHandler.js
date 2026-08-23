import { NotFoundError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  
  const body = {
    error: {
      message: status === 500 ? 'Something went wrong' : err.message,
      code: err.code || 'INTERNAL_ERROR',
    }
  };

  if (err.details) body.error.details = err.details;

  if (status >= 500) {
    console.error('Server error:', err);
  }

  res.status(status).json(body);
}

export function notFoundHandler(req, res, next) {
  next(new NotFoundError('Route'));
}