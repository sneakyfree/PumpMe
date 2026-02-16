/**
 * Rate Limiting Middleware
 *
 * In-memory rate limiter with configurable windows per route group.
 * Uses a simple sliding window counter. For production scale, swap to Redis.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
    windowMs: number;   // Time window in milliseconds
    maxRequests: number; // Max requests per window
    message?: string;
}

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (entry.resetAt < now) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

function getKey(req: Request, prefix: string): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    // If authenticated, use userId for more accurate limiting
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    return `${prefix}:${userId || ip}`;
}

export function rateLimit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const key = getKey(req, req.path);
        const now = Date.now();

        let entry = store.get(key);

        if (!entry || entry.resetAt < now) {
            entry = { count: 1, resetAt: now + config.windowMs };
            store.set(key, entry);
        } else {
            entry.count++;
        }

        // Set rate limit headers
        const remaining = Math.max(0, config.maxRequests - entry.count);
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

        if (entry.count > config.maxRequests) {
            res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMITED',
                    message: config.message || 'Too many requests. Please try again later.',
                    retryAfterMs: entry.resetAt - now,
                },
            });
            return;
        }

        next();
    };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const apiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'API rate limit exceeded. Max 100 requests per minute.',
});

export const strictRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many attempts. Please try again in 1 hour.',
});
