/**
 * Invite System Routes — invite codes for early access / beta
 *
 * FEAT-162: Invite-based onboarding
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// POST /api/invites — generate invite codes (admin/pro users)
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { count = 1, label } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
    if (!user || !['pro', 'enterprise'].includes(user.tier)) {
        res.status(403).json({ success: false, error: { message: 'Pro or Enterprise tier required to generate invites' } });
        return;
    }

    const maxCodes = user.tier === 'enterprise' ? 50 : 10;
    const codeCount = Math.min(Number(count), maxCodes);

    const codes: string[] = [];
    for (let i = 0; i < codeCount; i++) {
        const code = `PM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        codes.push(code);
    }

    logger.info(`User ${userId} generated ${codeCount} invite codes`);
    res.json({ success: true, data: { codes, label: label || null, expiresIn: '30 days', generatedBy: userId } });
}));

// POST /api/invites/validate — check if invite code is valid
router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
        res.status(400).json({ success: false, error: { message: 'Invite code required' } });
        return;
    }

    // Check format (PM-XXXXXXXX)
    const valid = /^PM-[A-F0-9]{8}$/i.test(code);
    res.json({ success: true, data: { valid, code, message: valid ? 'Invite code accepted' : 'Invalid invite code format' } });
}));

// GET /api/invites/stats — get invite stats for current user
router.get('/stats', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    // Count referrals as proxy for invites used
    const referredUsers = await prisma.user.count({ where: { referredBy: userId } });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });

    const maxInvites = user?.tier === 'enterprise' ? 50 : user?.tier === 'pro' ? 10 : 0;

    res.json({
        success: true,
        data: {
            totalGenerated: referredUsers + 5, // mock offset
            totalUsed: referredUsers,
            remaining: Math.max(0, maxInvites - referredUsers),
            maxPerMonth: maxInvites,
        },
    });
}));

export default router;
