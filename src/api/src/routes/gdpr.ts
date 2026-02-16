/**
 * GDPR Routes — data export & account deletion
 *
 * FEAT-148: GDPR compliance (data portability + right to erasure)
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// POST /api/gdpr/export — request full data export
router.post('/export', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const [user, sessions, transactions, apiKeys, notifications, tickets, teams] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, tier: true, creditBalance: true, emailVerified: true, createdAt: true } }),
        prisma.pumpSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.apiKey.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.supportTicket.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.teamMember.findMany({ where: { userId }, include: { team: { select: { name: true, slug: true } } } }),
    ]);

    const exportData = {
        exportedAt: new Date().toISOString(),
        format: 'PumpMe GDPR Data Export v1',
        user,
        sessions,
        transactions,
        apiKeys,
        notifications,
        supportTickets: tickets,
        teamMemberships: teams.map((t: { team: { name: string }; role: string; createdAt: Date }) => ({ teamName: t.team.name, role: t.role, joinedAt: t.createdAt })),
    };

    logger.info(`GDPR data export for user ${userId}`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="pumpme-data-${userId.slice(0, 8)}-${Date.now()}.json"`);
    res.json(exportData);
}));

// DELETE /api/gdpr/account — delete account and all data
router.delete('/account', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE MY ACCOUNT') {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Type "DELETE MY ACCOUNT" to confirm' } });
        return;
    }

    // Check for active sessions
    const activeSessions = await prisma.pumpSession.count({ where: { userId, status: { in: ['provisioning', 'running'] } } });
    if (activeSessions > 0) {
        res.status(409).json({ success: false, error: { code: 'ACTIVE_SESSIONS', message: 'Terminate all active sessions before deleting account' } });
        return;
    }

    // Cascade delete (Prisma cascade handles relations)
    await prisma.user.delete({ where: { id: userId } });

    logger.warn(`GDPR account deletion completed for user ${userId}`);
    res.clearCookie('token');
    res.json({ success: true, data: { message: 'Account and all data permanently deleted' } });
}));

// GET /api/gdpr/info — what data we store
router.get('/info', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            dataCategories: [
                { category: 'Account', items: ['Email', 'Name', 'Avatar URL', 'Tier', 'Credit balance'], retention: 'Until account deletion' },
                { category: 'Sessions', items: ['GPU type', 'Duration', 'Cost', 'Model used', 'Status'], retention: '90 days after session end' },
                { category: 'Billing', items: ['Transaction history', 'Stripe customer ID'], retention: 'As required by law (7 years)' },
                { category: 'API Keys', items: ['Key name', 'Key prefix', 'Usage stats'], retention: 'Until revoked + 30 days' },
                { category: 'Support', items: ['Tickets', 'Feedback', 'Ratings'], retention: '2 years' },
                { category: 'Analytics', items: ['Session frequency', 'GPU preferences'], retention: '12 months' },
            ],
            rights: ['Access (Article 15)', 'Rectification (Article 16)', 'Erasure (Article 17)', 'Portability (Article 20)', 'Objection (Article 21)'],
            contact: 'privacy@pumpme.io',
        },
    });
});

export default router;
