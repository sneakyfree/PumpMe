/**
 * WebSocket Event Service — real-time session updates
 *
 * Manages SSE connections for live session status, GPU metrics, notifications
 */

import { Request, Response } from 'express';
import { logger } from '../lib/logger.js';

interface SSEClient {
    id: string;
    userId: string;
    res: Response;
    connectedAt: Date;
}

class WebSocketEventService {
    private clients: Map<string, SSEClient> = new Map();

    /**
     * Register a new SSE connection
     */
    addClient(userId: string, res: Response): string {
        const clientId = `${userId}-${Date.now()}`;

        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        // Send initial ping
        res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

        const client: SSEClient = { id: clientId, userId, res, connectedAt: new Date() };
        this.clients.set(clientId, client);

        // Heartbeat every 30s
        const heartbeat = setInterval(() => {
            try { res.write(`event: ping\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`); }
            catch { this.removeClient(clientId); clearInterval(heartbeat); }
        }, 30000);

        // Clean up on disconnect
        res.on('close', () => {
            this.removeClient(clientId);
            clearInterval(heartbeat);
        });

        logger.info(`SSE client connected: ${clientId} (user: ${userId})`);
        return clientId;
    }

    /**
     * Remove a client connection
     */
    removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    /**
     * Send event to a specific user
     */
    sendToUser(userId: string, event: string, data: unknown): void {
        for (const client of this.clients.values()) {
            if (client.userId === userId) {
                try {
                    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
                } catch {
                    this.removeClient(client.id);
                }
            }
        }
    }

    /**
     * Broadcast event to all connected clients
     */
    broadcast(event: string, data: unknown): void {
        for (const client of this.clients.values()) {
            try {
                client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            } catch {
                this.removeClient(client.id);
            }
        }
    }

    // ── Convenience methods ──────────────────────────────────────────

    sendSessionUpdate(userId: string, sessionId: string, status: string, metrics?: Record<string, unknown>): void {
        this.sendToUser(userId, 'session_update', { sessionId, status, metrics, ts: Date.now() });
    }

    sendGpuMetrics(userId: string, sessionId: string, metrics: { gpuUtil: number; memUtil: number; temp: number }): void {
        this.sendToUser(userId, 'gpu_metrics', { sessionId, ...metrics, ts: Date.now() });
    }

    sendNotification(userId: string, notification: { type: string; title: string; message: string }): void {
        this.sendToUser(userId, 'notification', { ...notification, ts: Date.now() });
    }

    sendCreditUpdate(userId: string, balance: number): void {
        this.sendToUser(userId, 'credit_update', { balance, ts: Date.now() });
    }

    /**
     * Get connected client count
     */
    getClientCount(): number {
        return this.clients.size;
    }

    /**
     * Get clients for a specific user
     */
    getUserClientCount(userId: string): number {
        let count = 0;
        for (const client of this.clients.values()) {
            if (client.userId === userId) count++;
        }
        return count;
    }
}

export const wsEvents = new WebSocketEventService();
