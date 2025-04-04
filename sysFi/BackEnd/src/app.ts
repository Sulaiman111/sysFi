import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './user/user.routes';
import { errorHandler } from './middleware/error-handler';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);

// Error handling middleware
app.use(errorHandler);

export { app };