/**
 * Prometheus Metrics Middleware
 *
 * Exposes request counters, duration histograms, and active connection gauges
 * at /metrics for Prometheus scraping.
 */

import { Request, Response, NextFunction } from 'express';

// Simple in-process metrics (no prom-client needed for MVP)
interface MetricBucket {
    total: number;
    errors: number;
    durations: number[]; // last 1000 durations in ms
    byStatus: Record<string, number>;
    byMethod: Record<string, number>;
    byPath: Record<string, number>;
}

const metrics: MetricBucket = {
    total: 0,
    errors: 0,
    durations: [],
    byStatus: {},
    byMethod: {},
    byPath: {},
};

let activeConnections = 0;
const startTime = Date.now();

// Collect request metrics
export function metricsCollector(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    activeConnections++;

    res.on('finish', () => {
        activeConnections--;
        const duration = Date.now() - start;

        metrics.total++;
        if (res.statusCode >= 400) metrics.errors++;

        // Keep last 1000 durations for percentile calculations
        metrics.durations.push(duration);
        if (metrics.durations.length > 1000) metrics.durations.shift();

        const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;
        metrics.byStatus[statusGroup] = (metrics.byStatus[statusGroup] || 0) + 1;
        metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;

        // Normalize path (replace IDs with :id)
        const normalizedPath = req.route?.path || req.path.replace(/\/[a-z0-9]{20,}/gi, '/:id');
        metrics.byPath[normalizedPath] = (metrics.byPath[normalizedPath] || 0) + 1;
    });

    next();
}

function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
}

// Serve metrics in Prometheus text format
export function metricsEndpoint(_req: Request, res: Response): void {
    const sorted = [...metrics.durations].sort((a, b) => a - b);
    const avg = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;

    const lines: string[] = [
        '# HELP http_requests_total Total HTTP requests',
        '# TYPE http_requests_total counter',
        `http_requests_total ${metrics.total}`,
        '',
        '# HELP http_errors_total Total HTTP errors (4xx + 5xx)',
        '# TYPE http_errors_total counter',
        `http_errors_total ${metrics.errors}`,
        '',
        '# HELP http_active_connections Currently active connections',
        '# TYPE http_active_connections gauge',
        `http_active_connections ${activeConnections}`,
        '',
        '# HELP http_request_duration_ms Request duration in milliseconds',
        '# TYPE http_request_duration_ms summary',
        `http_request_duration_ms{quantile="0.5"} ${percentile(sorted, 0.5)}`,
        `http_request_duration_ms{quantile="0.9"} ${percentile(sorted, 0.9)}`,
        `http_request_duration_ms{quantile="0.99"} ${percentile(sorted, 0.99)}`,
        `http_request_duration_ms_avg ${avg.toFixed(2)}`,
        '',
        '# HELP process_uptime_seconds Process uptime',
        '# TYPE process_uptime_seconds gauge',
        `process_uptime_seconds ${((Date.now() - startTime) / 1000).toFixed(0)}`,
        '',
    ];

    // Status breakdown
    lines.push('# HELP http_requests_by_status Total requests by status group');
    lines.push('# TYPE http_requests_by_status counter');
    for (const [status, count] of Object.entries(metrics.byStatus)) {
        lines.push(`http_requests_by_status{status="${status}"} ${count}`);
    }
    lines.push('');

    // Method breakdown
    lines.push('# HELP http_requests_by_method Total requests by HTTP method');
    lines.push('# TYPE http_requests_by_method counter');
    for (const [method, count] of Object.entries(metrics.byMethod)) {
        lines.push(`http_requests_by_method{method="${method}"} ${count}`);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
}
