/**
 * Referral Routes — referral tracking, rewards, dashboard
 *
 * FEAT-130: Referral & growth system
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';

const router = Router();

const REFERRAL_REWARD_CENTS = 500; // $5 per referral

// GET /api/referrals — user's referral stats
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true },
    });

    if (!user?.referralCode) {
        // Generate a referral code if none exists
        const code = `PUMP-${userId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        await prisma.user.update({
            where: { id: userId },
            data: { referralCode: code },
        });
        user!.referralCode = code;
    }

    // Count referred users
    const referredUsers = await prisma.user.findMany({
        where: { referredBy: user!.referralCode! },
        select: { id: true, name: true, tier: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });

    // Count only those who've had a session (qualified referrals)
    const qualifiedIds = referredUsers.map(u => u.id);
    let qualifiedCount = 0;
    if (qualifiedIds.length > 0) {
        qualifiedCount = await prisma.pumpSession.groupBy({
            by: ['userId'],
            where: { userId: { in: qualifiedIds } },
        }).then(groups => groups.length);
    }

    const totalEarned = qualifiedCount * REFERRAL_REWARD_CENTS;

    res.json({
        success: true,
        data: {
            referralCode: user!.referralCode,
            referralUrl: `${process.env.APP_URL || 'https://pumpme.io'}/register?ref=${user!.referralCode}`,
            totalReferred: referredUsers.length,
            qualifiedReferrals: qualifiedCount,
            totalEarned,
            referredUsers: referredUsers.map(u => ({
                name: u.name || 'Anonymous',
                tier: u.tier,
                joinedAt: u.createdAt,
            })),
        },
    });
}));

// POST /api/referrals/claim — claim pending referral rewards
router.post('/claim', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true, creditBalance: true },
    });

    if (!user?.referralCode) {
        res.status(400).json({ success: false, error: { code: 'NO_REFERRAL_CODE', message: 'No referral code found' } });
        return;
    }

    // Find qualified referrals (users who have completed at least one session)
    const referredUsers = await prisma.user.findMany({
        where: { referredBy: user.referralCode },
        select: { id: true, name: true },
    });

    const referredIds = referredUsers.map(u => u.id);
    if (referredIds.length === 0) {
        res.json({ success: true, data: { credited: 0, message: 'No referrals yet' } });
        return;
    }

    // Check which have sessions
    const qualifiedGroups = await prisma.pumpSession.groupBy({
        by: ['userId'],
        where: { userId: { in: referredIds } },
    });

    const qualifiedCount = qualifiedGroups.length;
    const reward = qualifiedCount * REFERRAL_REWARD_CENTS;

    if (reward > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { increment: reward } },
        });

        await prisma.transaction.create({
            data: {
                userId,
                type: 'referral_bonus',
                amount: reward,
                description: `Referral bonus: ${qualifiedCount} qualified referrals`,
                status: 'completed',
            },
        });

        await notificationService.notifyReferralCredit(userId, reward, `${qualifiedCount} users`);
    }

    res.json({
        success: true,
        data: { credited: reward, qualifiedReferrals: qualifiedCount },
    });
}));

export default router;
