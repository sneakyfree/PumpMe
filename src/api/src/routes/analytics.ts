/**
 * Usage Analytics Routes — session and spend analytics
 *
 * FEAT-062: Usage analytics with time-series aggregation
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/usage — user's usage over time
router.get('/usage', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sessions = await prisma.pumpSession.findMany({
        where: { userId, createdAt: { gte: startDate } },
        select: { createdAt: true, totalMinutes: true, totalCost: true, status: true, gpuType: true, tier: true },
        orderBy: { createdAt: 'asc' },
    });

    // Aggregate by day
    const dailyMap = new Map<string, { sessions: number; minutes: number; cost: number }>();
    for (let d = 0; d < days; d++) {
        const date = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
        dailyMap.set(date.toISOString().split('T')[0], { sessions: 0, minutes: 0, cost: 0 });
    }

    sessions.forEach(s => {
        const day = s.createdAt.toISOString().split('T')[0];
        const entry = dailyMap.get(day);
        if (entry) {
            entry.sessions++;
            entry.minutes += s.totalMinutes || 0;
            entry.cost += s.totalCost || 0;
        }
    });

    const daily = Array.from(dailyMap.entries()).map(([date, stats]) => ({ date, ...stats }));

    // GPU breakdown
    const gpuBreakdown: Record<string, number> = {};
    sessions.forEach(s => {
        const gpu = s.gpuType || 'unknown';
        gpuBreakdown[gpu] = (gpuBreakdown[gpu] || 0) + 1;
    });

    // Tier breakdown
    const tierBreakdown: Record<string, number> = {};
    sessions.forEach(s => {
        const tier = s.tier || 'free';
        tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
    });

    // Totals
    const totals = {
        sessions: sessions.length,
        minutes: sessions.reduce((sum, s) => sum + (s.totalMinutes || 0), 0),
        cost: sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0),
        completed: sessions.filter(s => s.status === 'terminated').length,
        failed: sessions.filter(s => s.status === 'error').length,
    };

    res.json({ success: true, data: { daily, gpuBreakdown, tierBreakdown, totals, days } });
}));

// GET /api/analytics/spending — spending trend by category
router.get('/spending', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const transactions = await prisma.transaction.findMany({
        where: { userId },
        select: { type: true, amount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    const byType: Record<string, number> = {};
    transactions.forEach(t => {
        byType[t.type] = (byType[t.type] || 0) + (t.amount || 0);
    });

    // Monthly spending
    const monthly = new Map<string, number>();
    transactions.forEach(t => {
        const month = t.createdAt.toISOString().slice(0, 7);
        monthly.set(month, (monthly.get(month) || 0) + (t.amount || 0));
    });

    res.json({
        success: true,
        data: {
            byType,
            monthly: Array.from(monthly.entries()).map(([month, amount]) => ({ month, amount })),
            totalSpent: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        },
    });
}));

export default router;
