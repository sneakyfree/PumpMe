/**
 * Status Page Routes — platform health & uptime
 *
 * Public endpoint showing service status
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    latencyMs?: number;
    lastChecked: string;
}

// GET /api/status — platform status
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const checks: ServiceStatus[] = [];
    const now = new Date().toISOString();

    // Database check
    const dbStart = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.push({ name: 'Database', status: 'operational', latencyMs: Date.now() - dbStart, lastChecked: now });
    } catch {
        checks.push({ name: 'Database', status: 'outage', lastChecked: now });
    }

    // API check (self)
    checks.push({ name: 'API Server', status: 'operational', latencyMs: 0, lastChecked: now });

    // Auth service
    checks.push({ name: 'Authentication', status: 'operational', lastChecked: now });

    // GPU Providers (mock check — in production would ping providers)
    checks.push({ name: 'Vast.ai Provider', status: 'operational', lastChecked: now });
    checks.push({ name: 'RunPod Provider', status: 'operational', lastChecked: now });

    // Storage
    checks.push({ name: 'Object Storage (S3)', status: 'operational', lastChecked: now });

    // Payments
    checks.push({ name: 'Payment Processing', status: 'operational', lastChecked: now });

    const overallStatus = checks.some(c => c.status === 'outage')
        ? 'outage'
        : checks.some(c => c.status === 'degraded')
            ? 'degraded'
            : 'operational';

    // Recent incidents (mock — in production from incident DB)
    const incidents = [
        { id: '1', title: 'Scheduled maintenance — GPU cluster upgrade', status: 'resolved', severity: 'maintenance', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    // Uptime (mock — in production from monitoring)
    const uptime = { last24h: 99.99, last7d: 99.97, last30d: 99.95 };

    res.json({ success: true, data: { status: overallStatus, services: checks, uptime, incidents } });
}));

export default router;
