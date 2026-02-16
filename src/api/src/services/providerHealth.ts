/**
 * GPU Provider Health Monitor — tracks provider availability & latency
 *
 * FEAT-150: Provider health monitoring with automatic failover signals
 */

import { logger } from '../lib/logger.js';

interface ProviderHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
    lastChecked: Date;
    uptime24h: number;
    availableGpus: number;
    errorRate: number;
    region: string;
}

interface ProviderConfig {
    name: string;
    endpoint: string;
    apiKey: string;
    region: string;
    priority: number;
}

const PROVIDERS: ProviderConfig[] = [
    { name: 'Vast.ai', endpoint: 'https://console.vast.ai/api/v0', apiKey: process.env.VAST_API_KEY || '', region: 'us-east', priority: 1 },
    { name: 'RunPod', endpoint: 'https://api.runpod.io/v2', apiKey: process.env.RUNPOD_API_KEY || '', region: 'us-west', priority: 2 },
    { name: 'Lambda Labs', endpoint: 'https://cloud.lambdalabs.com/api/v1', apiKey: process.env.LAMBDA_API_KEY || '', region: 'us-central', priority: 3 },
];

class ProviderHealthMonitor {
    private health: Map<string, ProviderHealth> = new Map();
    private checkInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Initialize with default healthy state
        for (const provider of PROVIDERS) {
            this.health.set(provider.name, {
                name: provider.name,
                status: 'healthy',
                latencyMs: 0,
                lastChecked: new Date(),
                uptime24h: 99.9,
                availableGpus: 100,
                errorRate: 0,
                region: provider.region,
            });
        }
    }

    /**
     * Start periodic health checks
     */
    start(intervalMs = 60000): void {
        if (this.checkInterval) return;
        this.checkInterval = setInterval(() => this.checkAll(), intervalMs);
        logger.info('Provider health monitor started');
    }

    stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Check all providers
     */
    async checkAll(): Promise<void> {
        for (const provider of PROVIDERS) {
            await this.checkProvider(provider);
        }
    }

    /**
     * Check a single provider
     */
    private async checkProvider(config: ProviderConfig): Promise<void> {
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${config.endpoint}/health`, {
                signal: controller.signal,
                headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
            });
            clearTimeout(timeout);

            const latency = Date.now() - start;
            const current = this.health.get(config.name)!;

            this.health.set(config.name, {
                ...current,
                status: res.ok ? 'healthy' : 'degraded',
                latencyMs: latency,
                lastChecked: new Date(),
                errorRate: res.ok ? Math.max(0, current.errorRate - 0.5) : Math.min(100, current.errorRate + 5),
            });
        } catch {
            const current = this.health.get(config.name)!;
            this.health.set(config.name, {
                ...current,
                status: current.errorRate > 50 ? 'down' : 'degraded',
                latencyMs: Date.now() - start,
                lastChecked: new Date(),
                errorRate: Math.min(100, current.errorRate + 10),
            });
            logger.warn(`Provider ${config.name} health check failed`);
        }
    }

    /**
     * Get health status of all providers
     */
    getAll(): ProviderHealth[] {
        return Array.from(this.health.values());
    }

    /**
     * Get the best available provider
     */
    getBestProvider(): ProviderHealth | null {
        const healthy = this.getAll()
            .filter(p => p.status !== 'down')
            .sort((a, b) => {
                if (a.status === 'healthy' && b.status !== 'healthy') return -1;
                if (b.status === 'healthy' && a.status !== 'healthy') return 1;
                return a.latencyMs - b.latencyMs;
            });
        return healthy[0] || null;
    }

    /**
     * Check if a specific provider is available
     */
    isAvailable(providerName: string): boolean {
        const health = this.health.get(providerName);
        return health ? health.status !== 'down' : false;
    }
}

export const providerHealth = new ProviderHealthMonitor();
