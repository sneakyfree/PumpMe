/**
 * Account Routes — GDPR data export, account deletion, referrals
 *
 * FEAT-127, FEAT-143, FEAT-144
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sendSuccess } from '../lib/response.js';
import { AppError } from '../lib/errors.js';
import { logAudit } from '../services/auditService.js';

const router = Router();

/**
 * POST /api/account/export — request GDPR data export
 */
router.post('/export', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    // Collect all user data
    const [user, sessions, transactions, apiKeys, auditLogs] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, tier: true, creditBalance: true, createdAt: true },
        }),
        prisma.pumpSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.apiKey.findMany({
            where: { userId },
            select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true, isActive: true },
        }),
        prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1000,
        }),
    ]);

    await logAudit({
        userId,
        action: 'data.export_request',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });

    // Return JSON export (in production, this would be queued and emailed)
    sendSuccess(res, {
        exportDate: new Date().toISOString(),
        user,
        sessions,
        transactions,
        apiKeys,
        auditLogs,
    });
}));

/**
 * DELETE /api/account — request account deletion
 */
router.delete('/', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    const { password } = req.body;
    if (!password) throw new AppError('Password confirmation required', 400);

    // Verify password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const bcrypt = await import('bcryptjs');
    if (!user.passwordHash) throw new AppError('Cannot verify password for this account', 400);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Incorrect password', 401);

    // Terminate all active sessions
    await prisma.pumpSession.updateMany({
        where: { userId, status: { in: ['active', 'ready', 'provisioning', 'pending'] } },
        data: { status: 'terminated', terminatedAt: new Date(), terminationReason: 'user' },
    });

    // Revoke all API keys
    await prisma.apiKey.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
    });

    await logAudit({
        userId,
        action: 'data.delete_request',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });

    // Mark user for deletion (30-day grace period per GDPR)
    // In production: schedule deletion job, send confirmation email
    // For now: soft-delete by clearing PII
    await prisma.user.update({
        where: { id: userId },
        data: {
            email: `deleted-${userId}@deleted.pumpme.cloud`,
            name: 'Deleted User',
            passwordHash: 'DELETED',
        },
    });

    sendSuccess(res, { message: 'Account scheduled for deletion. You have 30 days to recover it.' });
}));

/**
 * GET /api/account/referral — get referral code and stats
 */
router.get('/referral', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) throw new AppError('Not authenticated', 401);

    // For now, generate a deterministic referral code from userId
    const referralCode = `PUMP-${userId.slice(-6).toUpperCase()}`;

    // Count referrals is a future feature — return 0 for now
    const referralCount = 0;

    sendSuccess(res, {
        referralCode,
        referralLink: `https://pumpme.cloud/register?ref=${referralCode}`,
        totalReferrals: referralCount,
        creditPerReferral: 500, // $5.00 in cents
    });
}));

export default router;
