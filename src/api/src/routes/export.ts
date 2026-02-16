/**
 * Session Export Routes — CSV/JSON export of session history
 *
 * FEAT-152: Data export for session analytics
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/export/sessions — export session history
router.get('/sessions', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const format = (req.query.format as string) || 'json';
    const limit = Math.min(parseInt(req.query.limit as string) || 500, 1000);
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const where: Record<string, unknown> = { userId };
    if (from || to) {
        where.createdAt = {};
        if (from) (where.createdAt as Record<string, Date>).gte = from;
        if (to) (where.createdAt as Record<string, Date>).lte = to;
    }

    const sessions = await prisma.pumpSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    if (format === 'csv') {
        const headers = ['id', 'modelId', 'gpuType', 'tier', 'status', 'totalMinutes', 'totalCost', 'createdAt', 'endedAt'];
        const rows = sessions.map((s: Record<string, unknown>) =>
            headers.map(h => {
                const val = s[h];
                if (val instanceof Date) return val.toISOString();
                if (val === null || val === undefined) return '';
                return String(val).replace(/,/g, ';');
            }).join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="pumpme-sessions-${Date.now()}.csv"`);
        res.send(csv);
        return;
    }

    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="pumpme-sessions-${Date.now()}.json"`);
    res.json({ success: true, data: { sessions, total: sessions.length, exportedAt: new Date().toISOString() } });
}));

// GET /api/export/transactions — export billing history
router.get('/transactions', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const format = (req.query.format as string) || 'json';
    const limit = Math.min(parseInt(req.query.limit as string) || 500, 1000);

    const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    if (format === 'csv') {
        const headers = ['id', 'type', 'amount', 'currency', 'description', 'status', 'createdAt'];
        const rows = transactions.map((t: Record<string, unknown>) =>
            headers.map(h => {
                const val = t[h];
                if (val instanceof Date) return val.toISOString();
                if (val === null || val === undefined) return '';
                return String(val).replace(/,/g, ';');
            }).join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="pumpme-transactions-${Date.now()}.csv"`);
        res.send(csv);
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="pumpme-transactions-${Date.now()}.json"`);
    res.json({ success: true, data: { transactions, total: transactions.length, exportedAt: new Date().toISOString() } });
}));

export default router;
