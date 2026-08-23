import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/syncboard',
};