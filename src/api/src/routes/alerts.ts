/**
 * System Alerts Routes — maintenance windows, incidents, announcements
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

interface Alert {
    id: string;
    type: 'maintenance' | 'incident' | 'announcement';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    startTime: string;
    endTime: string | null;
    active: boolean;
}

const alerts: Alert[] = [
    {
        id: 'alert-001',
        type: 'maintenance',
        severity: 'info',
        title: 'Scheduled Maintenance — Database Migration',
        message: 'Brief interruption to non-critical services. GPU sessions unaffected.',
        startTime: '2026-02-15T06:00:00Z',
        endTime: '2026-02-15T08:00:00Z',
        active: false,
    },
    {
        id: 'alert-002',
        type: 'announcement',
        severity: 'info',
        title: 'New: H100 GPUs Now Available on Lambda Labs',
        message: 'H100 80GB GPUs are now available through Lambda Labs at $2.49/hr.',
        startTime: '2026-02-09T00:00:00Z',
        endTime: null,
        active: true,
    },
];

// GET /api/alerts — current alerts
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const active = alerts.filter(a => {
        if (!a.active) return false;
        if (a.endTime && new Date(a.endTime) < now) return false;
        return true;
    });

    res.json({ success: true, data: { alerts: active, total: active.length } });
}));

// GET /api/alerts/all — all alerts (including past)
router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: { alerts, total: alerts.length } });
}));

export default router;
