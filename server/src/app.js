import express from 'express';
import cors from 'cors';
import helmet from 'helmet';  // ← ADD THIS
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());  // ← ADD THIS (before everything else)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', authenticate, boardRoutes);
app.use('/api/boards/:boardId/columns', authenticate, columnRoutes);
app.use('/api/boards/:boardId/tasks', authenticate, taskRoutes);
app.use('/api/boards/:boardId/tasks/:id', authenticate, commentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;