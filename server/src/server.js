import mongoose from 'mongoose';
import { config } from './config/config.js';
import app from './app.js';

// Validate required env vars before starting
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Warn about insecure default secret
if (process.env.JWT_SECRET === 'syncboard-secret-key-change-in-production') {
  console.warn('WARNING: Using default JWT_SECRET — change this before deploying!');
}

async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();