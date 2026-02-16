/**
 * Feedback/Support Routes — user feedback and support tickets
 *
 * FEAT-145: Feedback system with support tickets
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// POST /api/feedback — submit feedback
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { type, subject, message, rating, sessionId } = req.body;

    if (!type || !message) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'type and message are required' } });
        return;
    }

    const validTypes = ['bug', 'feature', 'general', 'support', 'complaint', 'praise'];
    if (!validTypes.includes(type)) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: `type must be one of: ${validTypes.join(', ')}` } });
        return;
    }

    const ticket = await prisma.supportTicket.create({
        data: {
            userId,
            type,
            subject: subject || `${type} feedback`,
            message,
            rating: rating ? Math.min(Math.max(parseInt(rating), 1), 5) : null,
            sessionId: sessionId || null,
            status: 'open',
            priority: type === 'bug' ? 'high' : type === 'complaint' ? 'medium' : 'low',
        },
    });

    logger.info(`Feedback submitted: ${ticket.id} (${type}) by user ${userId}`);

    res.status(201).json({
        success: true,
        data: { ticketId: ticket.id, status: 'open', message: 'Thank you for your feedback!' },
    });
}));

// GET /api/feedback — user's tickets
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.supportTicket.count({ where }),
    ]);

    res.json({
        success: true,
        data: { tickets, total, page, pages: Math.ceil(total / limit) },
    });
}));

// GET /api/feedback/:id — single ticket
router.get('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const ticket = await prisma.supportTicket.findFirst({
        where: { id: req.params.id, userId },
    });

    if (!ticket) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
        return;
    }

    res.json({ success: true, data: ticket });
}));

export default router;
