import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
    services: {
      api: 'up',
      database: 'up', // TODO: actual DB check
      redis: 'up',    // TODO: actual Redis check
    },
  });
});

// Readiness check
router.get('/ready', (req, res) => {
  // TODO: Check all dependencies
  res.json({ ready: true });
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({ alive: true });
});

export default router;
