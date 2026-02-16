/**
 * Leaderboard Routes — Pump community rankings
 *
 * FEAT-128: Pump Leaderboard with gamification
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// GET /api/leaderboard — top pumpers
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as string) || 'all';
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);

    const dateFilter: Record<string, unknown> = {};
    if (period === 'week') {
        dateFilter.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'month') {
        dateFilter.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Aggregate session stats per user
    const topUsers = await prisma.pumpSession.groupBy({
        by: ['userId'],
        where: {
            status: 'terminated',
            ...dateFilter,
        },
        _count: { _all: true },
        _sum: { totalCost: true, totalMinutes: true },
        orderBy: { _sum: { totalMinutes: 'desc' } },
        take: limit,
    });

    // Fetch user details
    const userIds = topUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, tier: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const leaderboard = topUsers.map((entry, index) => {
        const user = userMap.get(entry.userId);
        return {
            rank: index + 1,
            userId: entry.userId,
            name: user?.name || 'Anonymous Pumper',
            tier: user?.tier || 'free',
            sessionsCompleted: entry._count?._all || 0,
            totalMinutes: entry._sum?.totalMinutes || 0,
            totalSpent: entry._sum?.totalCost || 0,
            badge: getBadge(entry._count?._all || 0),
        };
    });

    res.json({ success: true, data: { leaderboard, period } });
}));

// GET /api/leaderboard/me — current user's rank
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId?: string }).userId;
    if (!userId) {
        res.json({ success: true, data: null });
        return;
    }

    const userStats = await prisma.pumpSession.aggregate({
        where: { userId, status: 'terminated' },
        _count: { _all: true },
        _sum: { totalCost: true, totalMinutes: true },
    });

    // Count users with more minutes to determine rank
    const usersAbove = await prisma.pumpSession.groupBy({
        by: ['userId'],
        where: { status: 'terminated' },
        _sum: { totalMinutes: true },
    });

    const myMinutes = userStats._sum?.totalMinutes || 0;
    const rank = usersAbove.filter(u => (u._sum?.totalMinutes || 0) > myMinutes).length + 1;

    res.json({
        success: true,
        data: {
            rank,
            sessionsCompleted: userStats._count?._all || 0,
            totalMinutes: userStats._sum?.totalMinutes || 0,
            totalSpent: userStats._sum?.totalCost || 0,
            badge: getBadge(userStats._count?._all || 0),
        },
    });
}));

function getBadge(sessionCount: number): { name: string; emoji: string } {
    if (sessionCount >= 500) return { name: 'Diamond Pumper', emoji: '💎' };
    if (sessionCount >= 200) return { name: 'Platinum Pumper', emoji: '🏆' };
    if (sessionCount >= 100) return { name: 'Gold Pumper', emoji: '🥇' };
    if (sessionCount >= 50) return { name: 'Silver Pumper', emoji: '🥈' };
    if (sessionCount >= 20) return { name: 'Bronze Pumper', emoji: '🥉' };
    if (sessionCount >= 5) return { name: 'Rising Pumper', emoji: '⭐' };
    return { name: 'New Pumper', emoji: '🌱' };
}

export default router;
