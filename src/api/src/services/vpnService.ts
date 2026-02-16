/**
 * VPN Service — Persistent GPU Labs management
 *
 * FEAT-074: VPN provisioning backend for long-lived GPU sessions
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';
import { orchestrator } from './orchestrator.js';

interface VpnInstance {
    sessionId: string;
    userId: string;
    status: 'provisioning' | 'running' | 'stopped' | 'hibernated';
    gpuType: string;
    storageGb: number;
    accessUrl?: string;
}

// Tier-based storage allocation
const VPN_STORAGE: Record<string, number> = {
    vpn_starter: 50,     // 50 GB
    vpn_pro: 200,        // 200 GB
    vpn_enterprise: 1000, // 1 TB
};

/**
 * Provision a new VPN (persistent lab) instance
 */
export async function provisionVpnInstance(userId: string, planId: string): Promise<VpnInstance> {
    const storageGb = VPN_STORAGE[planId] || 50;

    // Check if user already has a VPN instance
    const existing = await prisma.pumpSession.findFirst({
        where: { userId, type: 'vpn', status: { in: ['active', 'ready', 'provisioning'] } },
    });

    if (existing) {
        throw new AppError('You already have an active VPN instance. Stop it first.', 409);
    }

    // Map plan to GPU tier
    const tierMap: Record<string, string> = {
        vpn_starter: 'pro',
        vpn_pro: 'beast',
        vpn_enterprise: 'ultra',
    };

    const gpuTier = tierMap[planId] || 'pro';

    // Create session record
    const session = await prisma.pumpSession.create({
        data: {
            userId,
            type: 'vpn',
            tier: gpuTier,
            status: 'provisioning',
            provider: 'auto',
            gpuType: gpuTier === 'ultra' ? 'B300' : gpuTier === 'beast' ? 'H100' : 'RTX 5090',
            gpuCount: gpuTier === 'beast' || gpuTier === 'ultra' ? 8 : 1,
            pricePerMinute: gpuTier === 'ultra' ? 179 : gpuTier === 'beast' ? 89 : 29,
        },
    });

    // Provision GPU via orchestrator (async — webhook/polling will update status)
    try {
        const provisionResult = await orchestrator.provisionSession({
            tier: gpuTier as 'starter' | 'pro' | 'beast' | 'ultra',
            modelId: '', // VPN doesn't need a preloaded model
            sessionId: session.id,
            userId,
        });

        if (!provisionResult.success || !provisionResult.instance) {
            throw new Error(provisionResult.error || 'Provision failed');
        }

        await prisma.pumpSession.update({
            where: { id: session.id },
            data: {
                status: 'ready',
                provider: provisionResult.instance.provider,
                providerInstanceId: provisionResult.instance.providerInstanceId,
                accessUrl: provisionResult.instance.accessUrl,
                startedAt: new Date(),
            },
        });

        logger.info(`VPN instance provisioned for user ${userId}: ${session.id}`);

        return {
            sessionId: session.id,
            userId,
            status: 'running',
            gpuType: session.gpuType || gpuTier,
            storageGb,
            accessUrl: provisionResult.instance.accessUrl,
        };
    } catch (err) {
        await prisma.pumpSession.update({
            where: { id: session.id },
            data: { status: 'error' },
        });
        logger.error(`VPN provisioning failed for user ${userId}:`, err);
        throw new AppError('Failed to provision VPN instance. All providers may be at capacity.', 503);
    }
}

/**
 * Stop (hibernate) a VPN instance — GPU released, storage preserved
 */
export async function stopVpnInstance(sessionId: string, userId: string): Promise<void> {
    const session = await prisma.pumpSession.findFirst({
        where: { id: sessionId, userId, type: 'vpn' },
    });

    if (!session) throw new AppError('VPN session not found', 404);
    if (session.status === 'terminated') throw new AppError('VPN already terminated', 400);

    // Terminate the GPU instance (storage snapshot would be taken in production)
    if (session.providerInstanceId) {
        try {
            await orchestrator.terminateSession(session.providerInstanceId, session.provider || 'auto');
        } catch (err) {
            logger.error('Failed to terminate VPN provider instance:', err);
        }
    }

    // Calculate final billing
    const startedAt = session.startedAt || session.createdAt;
    const minutes = Math.ceil((Date.now() - startedAt.getTime()) / 60000);
    const cost = minutes * (session.pricePerMinute || 0);

    await prisma.pumpSession.update({
        where: { id: sessionId },
        data: {
            status: 'terminated',
            terminatedAt: new Date(),
            terminationReason: 'user',
            totalMinutes: minutes,
            totalCost: cost,
        },
    });

    // Deduct from user balance
    if (cost > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { decrement: cost } },
        });

        await prisma.transaction.create({
            data: {
                userId,
                amount: -cost,
                type: 'charge',
                description: `VPN session: ${minutes} min on ${session.gpuType}`,
                sessionId,
            },
        });
    }

    logger.info(`VPN instance stopped: ${sessionId}, billed ${minutes} min ($${(cost / 100).toFixed(2)})`);
}

/**
 * Get VPN instance status for a user
 */
export async function getVpnStatus(userId: string): Promise<VpnInstance | null> {
    const session = await prisma.pumpSession.findFirst({
        where: { userId, type: 'vpn', status: { in: ['active', 'ready', 'provisioning'] } },
        orderBy: { createdAt: 'desc' },
    });

    if (!session) return null;

    return {
        sessionId: session.id,
        userId: session.userId,
        status: session.status === 'ready' || session.status === 'active' ? 'running' : 'provisioning',
        gpuType: session.gpuType || 'Unknown',
        storageGb: 50, // Would come from subscription plan
        accessUrl: session.accessUrl || undefined,
    };
}
