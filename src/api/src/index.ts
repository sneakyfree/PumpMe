import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testDatabaseConnection } from './lib/prisma.js';
import { metricsCollector, metricsEndpoint } from './middleware/metrics.js';
import { authRateLimit, apiRateLimit } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import billingRoutes from './routes/billing.js';
import modelsRoutes from './routes/models.js';
import healthRoutes from './routes/health.js';
import chatRoutes from './routes/chat.js';
import paymentsRoutes from './routes/payments.js';
import { apiKeysRouter } from './routes/apiKeys.js';
import { sseRouter } from './lib/realtime.js';
import { startZombieCleanup } from './jobs/sessionCleanup.js';
import adminRoutes from './routes/admin.js';
import inferenceRoutes from './routes/inference.js';
import accountRoutes from './routes/account.js';
import subscriptionRoutes from './routes/subscriptions.js';
import storageRoutes from './routes/storage.js';
import notificationRoutes from './routes/notifications.js';
import leaderboardRoutes from './routes/leaderboard.js';
import analyticsRoutes from './routes/analytics.js';
import referralRoutes from './routes/referrals.js';
import feedbackRoutes from './routes/feedback.js';
import teamRoutes from './routes/teams.js';
import oauthRoutes from './routes/oauth.js';
import gdprRoutes from './routes/gdpr.js';
import statusRoutes from './routes/status.js';
import exportRoutes from './routes/export.js';
import marketplaceRoutes from './routes/marketplace.js';
import inviteRoutes from './routes/invites.js';
import webhookRoutes from './routes/webhooks.js';
import templateRoutes from './routes/templates.js';
import apiUsageRoutes from './routes/apiUsage.js';
import alertRoutes from './routes/alerts.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Banner
logger.info('');
logger.info('╔═══════════════════════════════════════════════════════════╗');
logger.info('║   🚀 PUMP ME - The most normie-friendly GPU platform 🚀   ║');
logger.info('║   "Show up. Click. Feel the speed. Get hooked."           ║');
logger.info('╚═══════════════════════════════════════════════════════════╝');
logger.info('');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json());

// Metrics collection
app.use(metricsCollector);

// Routes (with per-group rate limits)
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/sessions', apiRateLimit, sessionRoutes);
app.use('/api/billing', apiRateLimit, billingRoutes);
app.use('/api/models', modelsRoutes); // no limit — public browsing
app.use('/api/health', healthRoutes);
app.use('/api/chat', apiRateLimit, chatRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/keys', apiRateLimit, apiKeysRouter);
app.use('/api/admin', apiRateLimit, adminRoutes);
app.use('/api/account', apiRateLimit, accountRoutes);
app.use('/api/subscriptions', apiRateLimit, subscriptionRoutes);
app.use('/api/storage', apiRateLimit, storageRoutes);
app.use('/api/notifications', apiRateLimit, notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/analytics', apiRateLimit, analyticsRoutes);
app.use('/api/referrals', apiRateLimit, referralRoutes);
app.use('/api/feedback', apiRateLimit, feedbackRoutes);
app.use('/api/teams', apiRateLimit, teamRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/gdpr', apiRateLimit, gdprRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/export', apiRateLimit, exportRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/invites', apiRateLimit, inviteRoutes);
app.use('/api/webhooks', apiRateLimit, webhookRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/api-usage', apiRateLimit, apiUsageRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/upload', apiRateLimit, uploadRoutes);

// OpenAI-compatible inference API
app.use('/v1', inferenceRoutes);

// Real-time SSE endpoint
app.use('/api/sessions', sseRouter);

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Pump Me API',
      version: '0.1.0',
      message: 'The most normie-friendly GPU compute platform in the world',
      docs: '/api/docs',
    },
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// Start server
async function start() {
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    logger.info('✅ Database connected');
  } else {
    logger.warn('⚠️  Database not connected — running without persistence');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 Pump Me API running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);

    // Start background jobs
    startZombieCleanup();
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
