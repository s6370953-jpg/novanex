import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { healthCheck as dbHealthCheck } from './config/database';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  const dbHealthy = await dbHealthCheck();
  res.json({
    status: dbHealthy ? 'ok' : 'degraded',
    message: 'Learnova Tutor API is running',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
