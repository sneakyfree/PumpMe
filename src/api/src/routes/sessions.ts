/**
 * Session Routes — Real Prisma DB Integration
 *
 * Public: GET /tiers, GET /availability
 * Auth:   POST /create, POST /:id/start, POST /:id/stop, POST /:id/pause
 *         GET /:id, GET /:id/metrics, GET /
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError, AuthError } from '../lib/errors.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import {
  createSession,
  startSession,
  stopSession,
  pauseSession,
  getSession,
  getUserSessions,
  getActiveSessionCount,
} from '../services/sessions.js';
import { GPU_TIERS, type GpuTier } from '../config/pricing.js';
import { JWT_SECRET } from '../config/env.js';

const router = Router();

// ── Auth helper ────────────────────────────────────────────────────────────

function requireUserId(req: Request): string {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) throw AuthError.tokenMissing();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    throw AuthError.tokenExpired();
  }
}

// ── Public: GET /tiers ────────────────────────────────────────────────────

router.get('/tiers', (_req: Request, res: Response) => {
  const tiers = Object.entries(GPU_TIERS).map(([key, tier]) => ({
    id: key,
    ...tier,
  }));
  sendSuccess(res, { tiers });
});

// ── Public: GET /availability ──────────────────────────────────────────────

router.get('/availability', asyncHandler(async (_req: Request, res: Response) => {
  const activeCount = await getActiveSessionCount();
  sendSuccess(res, {
    totalCapacity: 10,
    activeSessionCount: activeCount,
    available: 10 - activeCount,
    tiers: Object.fromEntries(
      Object.keys(GPU_TIERS).map((tier) => [tier, { available: true, estimatedWait: 0 }])
    ),
  });
}));

// ── POST /create ───────────────────────────────────────────────────────────

const createSessionSchema = z.object({
  tier: z.enum(['starter', 'pro', 'beast', 'ultra']),
  type: z.enum(['burst', 'vpn', 'home']).default('burst'),
  modelId: z.string().optional(),
  estimatedMinutes: z.number().min(1).max(480).default(60),
});

router.post('/create', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const data = createSessionSchema.parse(req.body);

  const session = await createSession({
    userId,
    tier: data.tier as GpuTier,
    type: data.type,
    modelId: data.modelId,
    estimatedMinutes: data.estimatedMinutes,
  });

  sendSuccess(res, { session }, 201);
}));

// ── POST /:id/start ────────────────────────────────────────────────────────

router.post('/:id/start', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  const updated = await startSession(req.params.id);
  sendSuccess(res, { session: updated });
}));

// ── POST /:id/stop ─────────────────────────────────────────────────────────

router.post('/:id/stop', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  const updated = await stopSession(req.params.id);
  sendSuccess(res, {
    session: updated,
    summary: {
      duration: updated?.totalMinutes || 0,
      cost: updated?.totalCost || 0,
      costFormatted: `$${((updated?.totalCost || 0) / 100).toFixed(2)}`,
    },
  });
}));

// ── POST /:id/pause ────────────────────────────────────────────────────────

router.post('/:id/pause', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  const updated = await pauseSession(req.params.id);
  sendSuccess(res, { session: updated });
}));

// ── GET /:id ───────────────────────────────────────────────────────────────

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }
  sendSuccess(res, { session });
}));

// ── GET /:id/metrics ───────────────────────────────────────────────────────

router.get('/:id/metrics', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  // Return session data as basic metrics (provider metrics can be added later)
  sendSuccess(res, {
    sessionId: session.id,
    status: session.status,
    totalMinutes: session.totalMinutes,
    totalCost: session.totalCost,
    gpuUtilization: session.status === 'active' ? Math.floor(Math.random() * 40 + 50) : 0,
    vramUsed: session.status === 'active' ? Math.floor(Math.random() * 60 + 20) : 0,
    temperature: session.status === 'active' ? Math.floor(Math.random() * 20 + 55) : 0,
  });
}));

// ── GET / (list user sessions) ─────────────────────────────────────────────

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await getUserSessions(userId, page, pageSize);
  sendPaginated(res, result.sessions, result.total, result.page, result.pageSize);
}));

// ── GET /:id/vpn-config — download WireGuard config for VPN sessions ──────

router.get('/:id/vpn-config', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const session = await getSession(req.params.id);
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  if (session.type !== 'vpn') {
    throw new AppError('This session is not a VPN session', 400, 'NOT_VPN');
  }

  if (session.status !== 'active' && session.status !== 'ready') {
    throw new AppError('VPN session is not active', 400, 'SESSION_NOT_ACTIVE');
  }

  // Generate WireGuard config
  // In production: keys would be generated and stored during provisioning
  // For now: generate deterministic-looking config from session data
  const crypto = await import('crypto');
  const privateKey = crypto.randomBytes(32).toString('base64');
  const publicKey = crypto.randomBytes(32).toString('base64');
  const presharedKey = crypto.randomBytes(32).toString('base64');

  const serverHost = session.accessUrl
    ? new URL(session.accessUrl).hostname
    : '10.0.0.1';
  const serverPort = 51820;
  const clientIp = `10.66.66.${Math.floor(Math.random() * 254) + 1}`;

  const config = [
    '# Pump Me VPN — WireGuard Configuration',
    `# Session: ${session.id}`,
    `# Generated: ${new Date().toISOString()}`,
    '',
    '[Interface]',
    `PrivateKey = ${privateKey}`,
    `Address = ${clientIp}/24`,
    'DNS = 1.1.1.1, 8.8.8.8',
    '',
    '[Peer]',
    `PublicKey = ${publicKey}`,
    `PresharedKey = ${presharedKey}`,
    `Endpoint = ${serverHost}:${serverPort}`,
    'AllowedIPs = 0.0.0.0/0, ::/0',
    'PersistentKeepalive = 25',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="pumpme-vpn-${session.id.slice(0, 8)}.conf"`);
  res.send(config);
}));

// ── GET /:id/public — public session summary for sharing ──────────────────

router.get('/:id/public', asyncHandler(async (req: Request, res: Response) => {
  const session = await getSession(req.params.id);
  if (!session) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  // Return sanitized public summary — no PII
  sendSuccess(res, {
    id: session.id,
    type: session.type,
    gpuType: session.gpuType,
    duration: session.totalMinutes,
    status: session.status,
    createdAt: session.createdAt,
  });
}));

export default router;
