/**
 * API Key Management — generate and validate API keys for programmatic access
 *
 * FEAT-101
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { AppError } from '../lib/errors.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

export const apiKeysRouter = Router();

/**
 * List user's API keys
 */
apiKeysRouter.get('/', apiRateLimit, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    const keys = await prisma.apiKey.findMany({
        where: { userId },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            lastUsedAt: true,
            createdAt: true,
            expiresAt: true,
            isActive: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, { keys });
}));

/**
 * Create a new API key
 */
apiKeysRouter.post('/', apiRateLimit, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    const { name, expiresInDays } = req.body;
    if (!name || typeof name !== 'string') throw new AppError('Name is required', 400);

    // Check key limit (max 10 per user)
    const count = await prisma.apiKey.count({ where: { userId, isActive: true } });
    if (count >= 10) throw new AppError('Maximum 10 API keys allowed', 400);

    // Generate a secure key: pm_live_<random>
    const rawKey = `pm_live_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.slice(0, 12); // For display: pm_live_xxxx

    const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    const key = await prisma.apiKey.create({
        data: {
            userId,
            name,
            keyHash: hashedKey,
            keyPrefix: prefix,
            expiresAt,
            isActive: true,
        },
        select: { id: true, name: true, keyPrefix: true, createdAt: true, expiresAt: true },
    });

    // Return the raw key ONLY at creation time — it cannot be retrieved later
    sendSuccess(res, { key: { ...key, rawKey } }, 201);
}));

/**
 * Revoke an API key
 */
apiKeysRouter.delete('/:keyId', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    const { keyId } = req.params;

    const key = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!key) throw new AppError('API key not found', 404);

    await prisma.apiKey.update({
        where: { id: keyId },
        data: { isActive: false },
    });

    sendSuccess(res, { message: 'API key revoked' });
}));

/**
 * Middleware: validate API key from Authorization header
 * Supports: Authorization: Bearer pm_live_xxx
 */
export async function validateApiKey(apiKeyRaw: string): Promise<{ userId: string; keyId: string } | null> {
    if (!apiKeyRaw.startsWith('pm_live_')) return null;

    const hashedKey = crypto.createHash('sha256').update(apiKeyRaw).digest('hex');

    const key = await prisma.apiKey.findFirst({
        where: {
            keyHash: hashedKey,
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ],
        },
        select: { id: true, userId: true },
    });

    if (!key) return null;

    // Update last used timestamp (don't await — fire-and-forget)
    prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => { });

    return { userId: key.userId, keyId: key.id };
}
