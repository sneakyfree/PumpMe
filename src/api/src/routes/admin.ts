/**
 * Admin Routes — user management, session oversight, audit logs
 *
 * Only accessible to users with tier === 'admin'
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { AppError } from '../lib/errors.js';
import { logAudit } from '../services/auditService.js';
import { queryAuditLogs } from '../services/auditService.js';

const router = Router();

/** Middleware: require admin tier */
function requireAdmin(req: Request, _res: Response, next: () => void) {
    const user = (req as Request & { user?: { userId: string; tier?: string } }).user;
    if (!user || user.tier !== 'admin') {
        throw new AppError('Admin access required', 403);
    }
    next();
}

/**
 * GET /api/admin/stats — platform statistics
 */
router.get('/stats', requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
    const [userCount, sessionCount, activeSessionCount, totalRevenue] = await Promise.all([
        prisma.user.count(),
        prisma.pumpSession.count(),
        prisma.pumpSession.count({ where: { status: { in: ['active', 'ready', 'provisioning'] } } }),
        prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'charge' } }),
    ]);

    sendSuccess(res, {
        users: userCount,
        totalSessions: sessionCount,
        activeSessions: activeSessionCount,
        totalRevenue: totalRevenue._sum.amount || 0,
    });
}));

/**
 * GET /api/admin/users — list all users with pagination
 */
router.get('/users', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const search = (req.query.search as string) || '';

    const where = search
        ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true, email: true, name: true, tier: true,
                creditBalance: true, createdAt: true, lastLoginAt: true,
                _count: { select: { sessions: true, apiKeys: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
        }),
        prisma.user.count({ where }),
    ]);

    sendSuccess(res, { users, total, page, limit });
}));

/**
 * POST /api/admin/users/:id/suspend — suspend a user account
 */
router.post('/users/:id/suspend', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = (req as Request & { user?: { userId: string } }).user;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    // Terminate all active sessions
    await prisma.pumpSession.updateMany({
        where: { userId: id, status: { in: ['active', 'ready', 'provisioning', 'pending'] } },
        data: { status: 'terminated', terminatedAt: new Date(), terminationReason: 'admin' },
    });

    // Revoke all API keys
    await prisma.apiKey.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false },
    });

    await logAudit({
        userId: adminUser!.userId,
        action: 'admin.user_suspend',
        resource: `user:${id}`,
        details: { reason, targetEmail: user.email },
    });

    sendSuccess(res, { message: `User ${user.email} suspended` });
}));

/**
 * GET /api/admin/sessions — list all sessions with filters
 */
router.get('/sessions', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string;
    const provider = req.query.provider as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const sessions = await prisma.pumpSession.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    sendSuccess(res, { sessions });
}));

/**
 * GET /api/admin/audit-logs — query audit trail
 */
router.get('/audit-logs', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { userId, action, limit, offset } = req.query;

    const result = await queryAuditLogs({
        userId: userId as string,
        action: action as Parameters<typeof queryAuditLogs>[0]['action'],
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0,
    });

    sendSuccess(res, result);
}));

/**
 * POST /api/admin/users/:id/credit — adjust user credits (admin tool)
 */
router.post('/users/:id/credit', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, reason } = req.body; // amount in cents, can be negative

    if (!amount || typeof amount !== 'number') throw new AppError('Amount required', 400);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    await prisma.user.update({
        where: { id },
        data: { creditBalance: { increment: amount } },
    });

    await prisma.transaction.create({
        data: {
            userId: id,
            amount,
            type: amount > 0 ? 'credit' : 'charge',
            description: reason || `Admin credit adjustment: ${amount > 0 ? '+' : ''}$${(amount / 100).toFixed(2)}`,
        },
    });

    sendSuccess(res, { message: `Adjusted ${user.email} by $${(amount / 100).toFixed(2)}` });
}));

export default router;
