/**
 * Webhook Management Routes — developer webhook subscriptions
 *
 * FEAT-170: Webhook delivery for session/billing/system events
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

interface Webhook {
    id: string;
    userId: string;
    url: string;
    secret: string;
    events: string[];
    active: boolean;
    createdAt: string;
    lastDelivery: string | null;
    failureCount: number;
}

// In-memory store (in production, use DB)
const webhooks: Webhook[] = [];

const AVAILABLE_EVENTS = [
    'session.created', 'session.started', 'session.ended', 'session.failed',
    'payment.completed', 'payment.failed', 'credit.added', 'credit.low',
    'api_key.created', 'api_key.revoked',
    'team.member_added', 'team.member_removed',
    'quota.warning', 'quota.exceeded',
];

// GET /api/webhooks — list user's webhooks
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const userHooks = webhooks.filter(w => w.userId === userId);
    res.json({ success: true, data: { webhooks: userHooks.map(w => ({ ...w, secret: w.secret.slice(0, 8) + '...' })), availableEvents: AVAILABLE_EVENTS } });
}));

// POST /api/webhooks — create webhook
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { url, events } = req.body;

    if (!url || !events?.length) {
        res.status(400).json({ success: false, error: { message: 'URL and at least one event required' } });
        return;
    }

    const invalid = events.filter((e: string) => !AVAILABLE_EVENTS.includes(e));
    if (invalid.length) {
        res.status(400).json({ success: false, error: { message: `Invalid events: ${invalid.join(', ')}` } });
        return;
    }

    const existing = webhooks.filter(w => w.userId === userId);
    if (existing.length >= 10) {
        res.status(400).json({ success: false, error: { message: 'Maximum 10 webhooks per user' } });
        return;
    }

    const webhook: Webhook = {
        id: crypto.randomUUID(),
        userId,
        url,
        secret: `whsec_${crypto.randomBytes(24).toString('hex')}`,
        events,
        active: true,
        createdAt: new Date().toISOString(),
        lastDelivery: null,
        failureCount: 0,
    };

    webhooks.push(webhook);
    logger.info(`Webhook created: ${webhook.id} for user ${userId}`);
    res.status(201).json({ success: true, data: { webhook } });
}));

// DELETE /api/webhooks/:id — delete webhook
router.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const idx = webhooks.findIndex(w => w.id === req.params.id && w.userId === userId);
    if (idx === -1) { res.status(404).json({ success: false, error: { message: 'Webhook not found' } }); return; }
    webhooks.splice(idx, 1);
    res.json({ success: true, data: { message: 'Webhook deleted' } });
}));

// POST /api/webhooks/:id/test — send test event
router.post('/:id/test', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const webhook = webhooks.find(w => w.id === req.params.id && w.userId === userId);
    if (!webhook) { res.status(404).json({ success: false, error: { message: 'Webhook not found' } }); return; }

    const payload = { event: 'test.ping', timestamp: new Date().toISOString(), data: { message: 'Test delivery from PumpMe' } };
    const signature = crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex');

    try {
        await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-PumpMe-Signature': signature },
            body: JSON.stringify(payload),
        });
        webhook.lastDelivery = new Date().toISOString();
        res.json({ success: true, data: { message: 'Test event delivered', signature: signature.slice(0, 16) + '...' } });
    } catch {
        webhook.failureCount++;
        res.status(502).json({ success: false, error: { message: 'Delivery failed — check your endpoint' } });
    }
}));

export default router;
