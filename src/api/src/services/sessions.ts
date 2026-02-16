/**
 * Session Service — Prisma DB Integration
 *
 * Replaces in-memory Map with real database persistence.
 * Manages the pump session lifecycle: create → provision → active → terminated.
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError, ProviderError } from '../lib/errors.js';
import { provisionSession, terminateSession } from './orchestrator.js';
import { GPU_TIERS, type GpuTier } from '../config/pricing.js';
import type { ProvisionRequest } from '../types/provider.js';

// ── State Machine ──────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['provisioning', 'terminated'],
  provisioning: ['ready', 'terminated'],
  ready: ['active', 'terminated'],
  active: ['paused', 'terminated'],
  paused: ['active', 'terminated'],
  terminated: [],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── Billing Intervals (in-memory tracking for active sessions) ─────────

const billingIntervals = new Map<string, NodeJS.Timeout>();

// ── Session CRUD ───────────────────────────────────────────────────────────

export async function createSession(params: {
  userId: string;
  tier: GpuTier;
  type: string;
  modelId?: string;
  estimatedMinutes?: number;
}) {
  const tierConfig = GPU_TIERS[params.tier];
  if (!tierConfig) {
    throw new AppError(`Invalid tier: ${params.tier}`, 400, 'INVALID_TIER');
  }

  // Create session record in DB
  const session = await prisma.pumpSession.create({
    data: {
      userId: params.userId,
      type: params.type || 'burst',
      tier: params.tier,
      gpuType: tierConfig.gpuOptions[0],
      gpuCount: 1,
      modelId: params.modelId || null,
      modelName: params.modelId || null,
      status: 'pending',
      provider: 'pending',
      pricePerMinute: Math.round(tierConfig.pricePerMinute * 100), // Store in cents
      estimatedMinutes: params.estimatedMinutes || 60,
      totalCost: 0,
      totalMinutes: 0,
    },
  });

  logger.info(`Session created: ${session.id} for user ${params.userId} (tier: ${params.tier})`);

  // Attempt to provision
  try {
    await transitionTo(session.id, 'provisioning');

    const provisionRequest: ProvisionRequest = {
      sessionId: session.id,
      userId: params.userId,
      tier: params.tier,
      modelId: params.modelId,
    };

    const provisionResult = await provisionSession(provisionRequest);

    if (!provisionResult.success || !provisionResult.instance) {
      throw new AppError(provisionResult.error || 'Provisioning failed', 500, 'PROVISION_FAILED');
    }

    // Update with provision details
    const updated = await prisma.pumpSession.update({
      where: { id: session.id },
      data: {
        provider: provisionResult.instance.provider,
        providerInstanceId: provisionResult.instance.providerInstanceId,
        accessUrl: provisionResult.instance.accessUrl || null,
        status: 'ready',
      },
    });

    return updated;
  } catch (error) {
    // Failed to provision — mark as terminated
    await prisma.pumpSession.update({
      where: { id: session.id },
      data: { status: 'terminated', endedAt: new Date() },
    });
    throw ProviderError.provisionFailed(
      error instanceof Error ? error.message : 'Unknown provisioning error'
    );
  }
}

export async function startSession(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);

  if (session.status !== 'ready' && session.status !== 'paused') {
    throw new AppError(`Cannot start session in ${session.status} state`, 400, 'INVALID_STATE');
  }

  const updated = await prisma.pumpSession.update({
    where: { id: sessionId },
    data: {
      status: 'active',
      startedAt: session.startedAt || new Date(),
    },
  });

  // Start billing interval
  startBillingInterval(sessionId, updated.pricePerMinute || 0);

  logger.info(`Session started: ${sessionId}`);
  return updated;
}

export async function pauseSession(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);

  if (session.type !== 'vpn') {
    throw new AppError('Only VPN sessions can be paused', 400, 'PAUSE_NOT_ALLOWED');
  }

  await transitionTo(sessionId, 'paused');
  stopBillingInterval(sessionId);

  logger.info(`Session paused: ${sessionId}`);
  return prisma.pumpSession.findUnique({ where: { id: sessionId } });
}

export async function stopSession(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);

  // Stop billing
  stopBillingInterval(sessionId);

  // Terminate on provider
  if (session.providerInstanceId) {
    try {
      await terminateSession(session.providerInstanceId, session.provider || 'local');
    } catch (error) {
      logger.error(`Failed to terminate provider instance for ${sessionId}:`, error);
    }
  }

  // Calculate final bill
  const endedAt = new Date();
  const startedAt = session.startedAt || session.createdAt;
  const totalMinutes = Math.ceil((endedAt.getTime() - startedAt.getTime()) / 60000);
  const totalCost = totalMinutes * (session.pricePerMinute || 0);

  const updated = await prisma.pumpSession.update({
    where: { id: sessionId },
    data: {
      status: 'terminated',
      endedAt,
      totalMinutes,
      totalCost,
    },
  });

  // Deduct from user balance
  await prisma.user.update({
    where: { id: session.userId },
    data: { creditBalance: { decrement: totalCost } },
  });

  logger.info(`Session stopped: ${sessionId} (${totalMinutes}min, $${(totalCost / 100).toFixed(2)})`);
  return updated;
}

export async function getSession(sessionId: string) {
  return prisma.pumpSession.findUnique({ where: { id: sessionId } });
}

export async function getUserSessions(userId: string, page = 1, pageSize = 20) {
  const [sessions, total] = await Promise.all([
    prisma.pumpSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pumpSession.count({ where: { userId } }),
  ]);
  return { sessions, total, page, pageSize };
}

export async function getActiveSessionCount(): Promise<number> {
  return prisma.pumpSession.count({
    where: { status: { in: ['active', 'ready', 'provisioning'] } },
  });
}

// ── Internal Helpers ───────────────────────────────────────────────────────

async function getSessionOrThrow(sessionId: string) {
  const session = await prisma.pumpSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }
  return session;
}

async function transitionTo(sessionId: string, newStatus: string) {
  const session = await getSessionOrThrow(sessionId);
  if (!canTransition(session.status, newStatus)) {
    throw new AppError(
      `Cannot transition from ${session.status} to ${newStatus}`,
      400,
      'INVALID_TRANSITION'
    );
  }
  return prisma.pumpSession.update({
    where: { id: sessionId },
    data: { status: newStatus },
  });
}

function startBillingInterval(sessionId: string, pricePerMinuteCents: number) {
  stopBillingInterval(sessionId); // Clear any existing

  const interval = setInterval(async () => {
    try {
      await prisma.pumpSession.update({
        where: { id: sessionId },
        data: {
          totalMinutes: { increment: 1 },
          totalCost: { increment: pricePerMinuteCents },
        },
      });
    } catch (error) {
      logger.error(`Billing tick failed for session ${sessionId}:`, error);
      stopBillingInterval(sessionId);
    }
  }, 60_000); // Every 60 seconds

  billingIntervals.set(sessionId, interval);
}

function stopBillingInterval(sessionId: string) {
  const interval = billingIntervals.get(sessionId);
  if (interval) {
    clearInterval(interval);
    billingIntervals.delete(sessionId);
  }
}

// ── Zombie Session Cleanup ─────────────────────────────────────────────────

export async function cleanupZombieSessions() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const zombies = await prisma.pumpSession.findMany({
    where: {
      status: { in: ['active', 'provisioning', 'ready'] },
      updatedAt: { lt: thirtyMinutesAgo },
    },
  });

  for (const zombie of zombies) {
    try {
      logger.warn(`Cleaning up zombie session: ${zombie.id} (last updated: ${zombie.updatedAt})`);
      await stopSession(zombie.id);
    } catch (error) {
      logger.error(`Failed to cleanup zombie session ${zombie.id}:`, error);
    }
  }

  if (zombies.length > 0) {
    logger.info(`Cleaned up ${zombies.length} zombie sessions`);
  }
}
