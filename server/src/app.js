import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again in 15 minutes', code: 'RATE_LIMITED' } }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please slow down', code: 'RATE_LIMITED' } }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Auth routes — strict limit (brute force protection)
app.use('/api/auth', authLimiter, authRoutes);

// All other API routes — general limit
app.use('/api/boards', apiLimiter, authenticate, boardRoutes);
app.use('/api/boards/:boardId/columns', apiLimiter, authenticate, columnRoutes);
app.use('/api/boards/:boardId/tasks', apiLimiter, authenticate, taskRoutes);
app.use('/api/boards/:boardId/tasks/:id', apiLimiter, authenticate, commentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;