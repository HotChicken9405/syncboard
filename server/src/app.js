import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
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

// NoSQL injection protection
app.use(mongoSanitize());

// CORS — tightened
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again in 15 minutes', code: 'RATE_LIMITED' } }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please slow down', code: 'RATE_LIMITED' } }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/boards', apiLimiter, authenticate, boardRoutes);
app.use('/api/boards/:boardId/columns', apiLimiter, authenticate, columnRoutes);
app.use('/api/boards/:boardId/tasks', apiLimiter, authenticate, taskRoutes);
app.use('/api/boards/:boardId/tasks/:id', apiLimiter, authenticate, commentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;