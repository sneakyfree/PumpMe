/**
 * API Usage Routes — usage analytics for API keys
 *
 * FEAT-180: API usage tracking and analytics
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/api-usage — usage stats for current user's API keys
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);

    const keys = await prisma.apiKey.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

    // Generate mock usage data (in production, from request logs)
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
    const dailyUsage = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate); date.setDate(date.getDate() + i);
        return {
            date: date.toISOString().split('T')[0],
            requests: Math.floor(Math.random() * 500 + 50),
            tokens: Math.floor(Math.random() * 50000 + 5000),
            errors: Math.floor(Math.random() * 10),
            latencyP50: Math.floor(Math.random() * 200 + 100),
            latencyP95: Math.floor(Math.random() * 800 + 300),
        };
    });

    const totals = dailyUsage.reduce((acc, d) => ({
        requests: acc.requests + d.requests,
        tokens: acc.tokens + d.tokens,
        errors: acc.errors + d.errors,
    }), { requests: 0, tokens: 0, errors: 0 });

    const topModels = [
        { model: 'meta-llama/Llama-3.1-70B-Instruct', requests: Math.floor(totals.requests * 0.35), tokens: Math.floor(totals.tokens * 0.4) },
        { model: 'mistralai/Mistral-7B-Instruct-v0.3', requests: Math.floor(totals.requests * 0.25), tokens: Math.floor(totals.tokens * 0.2) },
        { model: 'codellama/CodeLlama-34b-Instruct-hf', requests: Math.floor(totals.requests * 0.2), tokens: Math.floor(totals.tokens * 0.25) },
        { model: 'stabilityai/stable-diffusion-xl', requests: Math.floor(totals.requests * 0.15), tokens: Math.floor(totals.tokens * 0.1) },
    ];

    res.json({
        success: true,
        data: {
            keys: keys.map(k => ({ id: k.id, name: k.name, keyPrefix: k.keyPrefix, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt })),
            period: { days, from: startDate.toISOString(), to: new Date().toISOString() },
            totals,
            dailyUsage,
            topModels,
            errorRate: totals.requests > 0 ? Math.round((totals.errors / totals.requests) * 10000) / 100 : 0,
        },
    });
}));

export default router;
