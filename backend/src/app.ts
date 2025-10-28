import cors from 'cors';
import express from 'express';
import { getPrismaClient } from './prisma';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/db/health', async (_req, res) => {
    const prisma = getPrismaClient();

    if (!prisma) {
      res.status(200).json({
        connected: false,
        reason: 'DATABASE_URL is not configured'
      });
      return;
    }

    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      res.json({ connected: true });
    } catch (error) {
      res.status(500).json({
        connected: false,
        error: error instanceof Error ? error.message : 'Unable to verify database connection'
      });
    }
  });

  return app;
};

const app = createApp();
export default app;
