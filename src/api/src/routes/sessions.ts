/**
 * Session Routes
 * 
 * REST API endpoints for Pump Sessions.
 * This is the primary interface normies interact with.
 * 
 * "Show up. Click. Feel the speed. Get hooked."
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { sessionService } from '../services/sessions';
import { GPU_TIERS, GpuTier } from '../types/provider';
import { orchestrator } from '../services/orchestrator';

const router = Router();

// =============================================================================
// PUBLIC ENDPOINTS (No Auth Required)
// =============================================================================

/**
 * GET /api/sessions/tiers
 * List available GPU tiers with pricing
 */
router.get('/tiers', async (req, res) => {
  const tiers = Object.entries(GPU_TIERS).map(([key, config]) => ({
    id: key,
    ...config,
    pricePerHour: config.pricePerMinute * 60,
  }));
  
  res.json({
    tiers,
    message: "Pick your power level. We'll handle the rest. 💪",
  });
});

/**
 * GET /api/sessions/availability
 * Check real-time GPU availability across all providers
 */
router.get('/availability', async (req, res) => {
  try {
    const healthChecks = await orchestrator.checkAllProviders();
    
    const availability = healthChecks.map(h => ({
      provider: h.provider,
      isHealthy: h.isHealthy,
      latencyMs: h.latencyMs,
      gpus: h.availableGpus,
    }));
    
    res.json({
      availability,
      totalProviders: healthChecks.length,
      healthyProviders: healthChecks.filter(h => h.isHealthy).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

const createSessionSchema = z.object({
  tier: z.enum(['starter', 'pro', 'beast', 'ultra'] as const),
  type: z.enum(['burst', 'vpn', 'home']).optional(),
  modelId: z.string().optional(),
  estimatedMinutes: z.number().min(5).max(1440).optional(),
});

/**
 * POST /api/sessions/create
 * Create a new Pump Session
 * 
 * The magic endpoint. User picks tier, we spin up a GPU.
 * No terminal. No SSH. Just click and pump.
 */
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { tier, type, modelId, estimatedMinutes } = createSessionSchema.parse(req.body);
    
    const result = await sessionService.createSession({
      userId: req.user!.userId,
      type: type || 'burst',
      tier: tier as GpuTier,
      modelId,
      estimatedMinutes,
    });
    
    if (!result.success) {
      return res.status(503).json({
        error: 'Provisioning failed',
        message: result.error,
        suggestion: 'Try a different tier or wait a moment and retry.',
      });
    }
    
    const session = result.session!;
    const tierConfig = GPU_TIERS[tier];
    
    res.status(201).json({
      sessionId: session.id,
      status: session.status,
      tier: session.tier,
      tierInfo: {
        name: tierConfig.name,
        description: tierConfig.description,
        pricePerMinute: `$${tierConfig.pricePerMinute.toFixed(2)}`,
        pricePerHour: `$${(tierConfig.pricePerMinute * 60).toFixed(2)}`,
      },
      provider: session.provider,
      modelId: session.modelId,
      accessUrl: session.accessUrl,
      message: session.status === 'ready'
        ? "🚀 Your GPU is ready! Start pumping!"
        : "🔧 Your GPU is warming up. Check status in a moment.",
      _links: {
        self: `/api/sessions/${session.id}`,
        start: `/api/sessions/${session.id}/start`,
        stop: `/api/sessions/${session.id}/stop`,
        metrics: `/api/sessions/${session.id}/metrics`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/sessions/:id
 * Get session status and details
 */
router.get('/:id', requireAuth, (req, res) => {
  const session = sessionService.getSession(req.params.id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (session.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const tierConfig = GPU_TIERS[session.tier];
  
  res.json({
    sessionId: session.id,
    status: session.status,
    type: session.type,
    tier: session.tier,
    tierInfo: {
      name: tierConfig.name,
      pricePerMinute: `$${tierConfig.pricePerMinute.toFixed(2)}`,
    },
    provider: session.provider,
    modelId: session.modelId,
    accessUrl: session.accessUrl,
    timing: {
      requestedAt: session.requestedAt,
      provisionedAt: session.provisionedAt,
      startedAt: session.startedAt,
      pausedAt: session.pausedAt,
      terminatedAt: session.terminatedAt,
    },
    billing: {
      totalMinutes: session.totalMinutes,
      totalCost: `$${(session.totalCost / 100).toFixed(2)}`,
      pricePerMinute: `$${(session.pricePerMinute / 100).toFixed(2)}`,
    },
  });
});

/**
 * POST /api/sessions/:id/start
 * Start a ready session (begins billing)
 */
router.post('/:id/start', requireAuth, async (req, res) => {
  const result = await sessionService.startSession(req.params.id, req.user!.userId);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Failed to start session',
      message: result.error,
    });
  }
  
  res.json({
    sessionId: result.session!.id,
    status: result.session!.status,
    accessUrl: result.session!.accessUrl,
    message: "🔥 Let's pump! Billing has started.",
    billing: {
      pricePerMinute: `$${(result.session!.pricePerMinute / 100).toFixed(2)}`,
      startedAt: result.session!.startedAt,
    },
  });
});

/**
 * POST /api/sessions/:id/stop
 * Stop a session (ends billing, terminates GPU)
 */
router.post('/:id/stop', requireAuth, async (req, res) => {
  const result = await sessionService.stopSession(req.params.id, req.user!.userId);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Failed to stop session',
      message: result.error,
    });
  }
  
  res.json({
    sessionId: result.session!.id,
    status: result.session!.status,
    message: "💪 Session complete. Thanks for pumping!",
    summary: {
      totalMinutes: result.session!.totalMinutes,
      totalCost: `$${(result.session!.totalCost / 100).toFixed(2)}`,
      startedAt: result.session!.startedAt,
      terminatedAt: result.session!.terminatedAt,
    },
  });
});

/**
 * POST /api/sessions/:id/pause
 * Pause a session (VPN only - pauses billing but keeps state)
 */
router.post('/:id/pause', requireAuth, async (req, res) => {
  const result = await sessionService.pauseSession(req.params.id, req.user!.userId);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Failed to pause session',
      message: result.error,
    });
  }
  
  res.json({
    sessionId: result.session!.id,
    status: result.session!.status,
    message: "⏸️ Session paused. Resume anytime.",
    billing: {
      totalMinutes: result.session!.totalMinutes,
      totalCostSoFar: `$${(result.session!.totalCost / 100).toFixed(2)}`,
      pausedAt: result.session!.pausedAt,
    },
  });
});

/**
 * GET /api/sessions/:id/metrics
 * Get real-time GPU metrics for a session
 */
router.get('/:id/metrics', requireAuth, async (req, res) => {
  const metrics = await sessionService.getSessionMetrics(req.params.id, req.user!.userId);
  
  if (!metrics) {
    return res.status(404).json({ error: 'Metrics not available' });
  }
  
  res.json({
    sessionId: req.params.id,
    metrics: {
      gpuUtilization: `${metrics.gpuUtilization.toFixed(1)}%`,
      memoryUsed: `${metrics.memoryUsed.toFixed(1)}%`,
      temperature: `${metrics.temperature.toFixed(0)}°C`,
      powerDraw: `${metrics.powerDraw.toFixed(0)}W`,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/sessions
 * List user's sessions (with pagination)
 */
router.get('/', requireAuth, (req, res) => {
  const sessions = sessionService.getUserSessions(req.user!.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;
  
  const paginatedSessions = sessions.slice(offset, offset + limit);
  
  res.json({
    sessions: paginatedSessions.map(s => ({
      sessionId: s.id,
      type: s.type,
      tier: s.tier,
      status: s.status,
      provider: s.provider,
      totalMinutes: s.totalMinutes,
      totalCost: `$${(s.totalCost / 100).toFixed(2)}`,
      requestedAt: s.requestedAt,
      terminatedAt: s.terminatedAt,
    })),
    pagination: {
      total: sessions.length,
      page,
      limit,
      pages: Math.ceil(sessions.length / limit),
    },
  });
});

/**
 * GET /api/sessions/stats
 * Get platform-wide session stats (admin/debug)
 */
router.get('/stats/overview', optionalAuth, (req, res) => {
  const stats = sessionService.getStats();
  
  res.json({
    stats,
    timestamp: new Date().toISOString(),
  });
});

export default router;
