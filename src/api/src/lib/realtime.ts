/**
 * WebSocket Manager — real-time session updates via Server-Sent Events (SSE)
 *
 * Uses SSE instead of raw WebSocket for simpler deployment (works through
 * standard HTTP proxies, load balancers, and Cloudflare).
 *
 * Clients connect to GET /api/sessions/:id/stream for live updates.
 * FEAT-051
 */

import { Request, Response, Router } from 'express';
import { logger } from '../lib/logger.js';

// Track active SSE connections per session
const connections = new Map<string, Set<Response>>();

/**
 * Register an SSE connection for a session
 */
function subscribe(sessionId: string, res: Response): void {
    if (!connections.has(sessionId)) {
        connections.set(sessionId, new Set());
    }
    connections.get(sessionId)!.add(res);
    logger.debug(`SSE: Client subscribed to session ${sessionId} (${connections.get(sessionId)!.size} total)`);
}

/**
 * Remove an SSE connection
 */
function unsubscribe(sessionId: string, res: Response): void {
    const set = connections.get(sessionId);
    if (set) {
        set.delete(res);
        if (set.size === 0) connections.delete(sessionId);
    }
}

/**
 * Broadcast an event to all clients watching a session
 */
export function broadcastSessionEvent(
    sessionId: string,
    event: string,
    data: Record<string, unknown>,
): void {
    const set = connections.get(sessionId);
    if (!set || set.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) {
        try {
            res.write(payload);
        } catch {
            unsubscribe(sessionId, res);
        }
    }
}

/**
 * Broadcast a session status change
 */
export function broadcastStatusChange(
    sessionId: string,
    status: string,
    metadata?: Record<string, unknown>,
): void {
    broadcastSessionEvent(sessionId, 'status', { sessionId, status, ...metadata, timestamp: new Date().toISOString() });
}

/**
 * Broadcast session metrics (GPU utilization, cost, timer)
 */
export function broadcastMetrics(
    sessionId: string,
    metrics: {
        elapsedMinutes: number;
        currentCost: number;
        gpuUtilization?: number;
        memoryUsed?: number;
        temperature?: number;
    },
): void {
    broadcastSessionEvent(sessionId, 'metrics', { sessionId, ...metrics, timestamp: new Date().toISOString() });
}

/**
 * Get count of active SSE connections
 */
export function getConnectionCount(): number {
    let total = 0;
    for (const set of connections.values()) {
        total += set.size;
    }
    return total;
}

/**
 * SSE route handler — clients connect here to receive real-time updates
 */
export const sseRouter = Router();

sseRouter.get('/:id/stream', (req: Request, res: Response): void => {
    const sessionId = req.params.id;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Send initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ sessionId, message: 'Connected to session stream' })}\n\n`);

    // Register connection
    subscribe(sessionId, res);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
        try {
            res.write(`: heartbeat\n\n`);
        } catch {
            clearInterval(heartbeat);
            unsubscribe(sessionId, res);
        }
    }, 30_000);

    // Cleanup on disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        unsubscribe(sessionId, res);
        logger.debug(`SSE: Client disconnected from session ${sessionId}`);
    });
});
