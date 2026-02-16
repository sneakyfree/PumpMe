/**
 * Notification Routes — user notification center API
 *
 * FEAT-051: Notification endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';

const router = Router();

// GET /api/notifications — list notifications
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const result = await notificationService.getAll(userId, page, limit);

    res.json({
        success: true,
        data: {
            notifications: result.notifications,
            total: result.total,
            page,
            pages: Math.ceil(result.total / limit),
        },
    });
}));

// GET /api/notifications/unread — unread count
router.get('/unread', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
}));

// POST /api/notifications/:id/read — mark one as read
router.post('/:id/read', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    await notificationService.markRead(req.params.id, userId);
    res.json({ success: true });
}));

// POST /api/notifications/read-all — mark all as read
router.post('/read-all', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    await notificationService.markAllRead(userId);
    res.json({ success: true });
}));

export default router;
