import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { config } from './config/config.js';
import app from './app.js';
import { initSocket } from './socket/socketHandler.js';

const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET === 'syncboard-secret-key-change-in-production') {
  console.warn('WARNING: Using default JWT_SECRET — change this before deploying!');
}

const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io);

async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');
    httpServer.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();