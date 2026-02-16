/**
 * Health Check Routes — with real DB check
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sendSuccess } from '../lib/response.js';
import { testDatabaseConnection } from '../lib/prisma.js';

const router = Router();

// GET /api/health
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const dbHealthy = await testDatabaseConnection();

  sendSuccess(res, {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    checks: {
      database: dbHealthy ? 'connected' : 'disconnected',
      api: 'running',
    },
  });
}));

// GET /api/health/ready
router.get('/ready', asyncHandler(async (_req: Request, res: Response) => {
  const dbHealthy = await testDatabaseConnection();

  if (!dbHealthy) {
    res.status(503).json({
      success: false,
      error: { code: 'NOT_READY', message: 'Database not connected' },
    });
    return;
  }

  sendSuccess(res, { ready: true });
}));

// GET /api/health/live
router.get('/live', (_req: Request, res: Response) => {
  sendSuccess(res, { alive: true });
});

export default router;
