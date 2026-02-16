/**
 * Vast.ai Provider — GPU provisioning via Vast.ai marketplace
 *
 * API docs: https://vast.ai/docs/api
 * Provides access to consumer and datacenter GPUs at competitive prices.
 */

import type { GpuProvider, ProvisionRequest, ProvisionResult, ProviderHealth, ProviderCapabilities, GpuInstance } from '../types/provider.js';
import { logger } from '../lib/logger.js';

const VAST_API_BASE = 'https://console.vast.ai/api/v0';

export class VastProvider implements GpuProvider {
    readonly slug = 'vast';
    readonly name = 'Vast.ai';
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.VAST_API_KEY || '';
        if (!this.apiKey) {
            logger.warn('VAST_API_KEY not set — Vast.ai provider disabled');
        }
    }

    async healthCheck(): Promise<ProviderHealth> {
        if (!this.apiKey) {
            return { provider: this.slug, isHealthy: false, latencyMs: 0, lastCheck: new Date(), availableGpus: [], error: 'VAST_API_KEY not configured' };
        }
        const start = Date.now();
        try {
            const response = await fetch(`${VAST_API_BASE}/bundles?q={"verified":{"eq":true},"num_gpus":{"eq":1}}&limit=5`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            const latencyMs = Date.now() - start;
            if (!response.ok) {
                return { provider: this.slug, isHealthy: false, latencyMs, lastCheck: new Date(), availableGpus: [], error: `HTTP ${response.status}` };
            }
            const data = await response.json() as { offers?: Array<{ gpu_name: string; dph_total: number }> };
            const offers = data.offers || [];
            const gpuMap = new Map<string, { available: number; minPrice: number }>();
            for (const offer of offers) {
                const existing = gpuMap.get(offer.gpu_name);
                if (existing) { existing.available++; existing.minPrice = Math.min(existing.minPrice, offer.dph_total); }
                else { gpuMap.set(offer.gpu_name, { available: 1, minPrice: offer.dph_total }); }
            }
            return {
                provider: this.slug, isHealthy: true, latencyMs, lastCheck: new Date(),
                availableGpus: Array.from(gpuMap.entries()).map(([type, info]) => ({ type, available: info.available, pricePerHour: info.minPrice })),
            };
        } catch (err) {
            return { provider: this.slug, isHealthy: false, latencyMs: Date.now() - start, lastCheck: new Date(), availableGpus: [], error: String(err) };
        }
    }

    async getCapabilities(): Promise<ProviderCapabilities> {
        return {
            provider: this.slug, name: this.name,
            gpuTypes: ['RTX 4090', 'A100 40GB', 'A100 80GB', 'H100 80GB'],
            regions: ['us-east', 'us-west', 'eu-west'],
            supportsPreloadedModels: false, supportsPause: false, supportsSnapshot: false,
            minPricePerHour: 0.30, maxPricePerHour: 3.50,
        };
    }

    async getAvailability(): Promise<{ type: string; available: number; pricePerHour: number; region: string }[]> {
        const health = await this.healthCheck();
        return health.availableGpus.map(g => ({ ...g, region: 'global' }));
    }

    async provision(request: ProvisionRequest): Promise<ProvisionResult> {
        if (!this.apiKey) return { success: false, error: 'VAST_API_KEY not configured' };
        try {
            const searchParams = { verified: { eq: true }, num_gpus: { eq: request.gpuCount || 1 } };
            const searchResponse = await fetch(`${VAST_API_BASE}/bundles?q=${JSON.stringify(searchParams)}&order=dph_total&limit=1`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            const searchData = await searchResponse.json() as { offers?: Array<{ id: number; gpu_name: string; dph_total: number; gpu_ram: number }> };
            const offers = searchData.offers || [];
            if (offers.length === 0) return { success: false, error: 'No matching GPU offers found on Vast.ai' };

            const best = offers[0];
            const createResponse = await fetch(`${VAST_API_BASE}/asks/${best.id}/`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: 'pumpme', image: 'nvidia/cuda:12.2.0-runtime-ubuntu22.04', disk: 20 }),
            });
            if (!createResponse.ok) return { success: false, error: `Vast.ai provision failed: ${createResponse.status}` };
            const instanceData = await createResponse.json() as { new_contract: number };

            return {
                success: true,
                instance: {
                    id: String(instanceData.new_contract), provider: this.slug, providerInstanceId: String(instanceData.new_contract),
                    gpuType: best.gpu_name, gpuCount: request.gpuCount || 1, vramGb: best.gpu_ram || 24,
                    status: 'provisioning', pricePerHour: best.dph_total, createdAt: new Date(), accessUrl: '',
                },
            };
        } catch (err) {
            logger.error('Vast.ai provision error:', err);
            return { success: false, error: String(err) };
        }
    }

    async getStatus(instanceId: string): Promise<GpuInstance | null> {
        if (!this.apiKey) return null;
        try {
            const response = await fetch(`${VAST_API_BASE}/instances/${instanceId}/`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
            if (!response.ok) return null;
            const data = await response.json() as { actual_status?: string; gpu_name?: string; dph_total?: number; num_gpus?: number; gpu_ram?: number };
            const statusMap: Record<string, GpuInstance['status']> = { running: 'running', loading: 'provisioning', created: 'pending', exited: 'stopped' };
            return {
                id: instanceId, provider: this.slug, providerInstanceId: instanceId,
                gpuType: data.gpu_name || 'unknown', gpuCount: data.num_gpus || 1, vramGb: data.gpu_ram || 0,
                status: statusMap[data.actual_status || ''] || 'pending', pricePerHour: data.dph_total || 0, createdAt: new Date(),
            };
        } catch { return null; }
    }

    async start(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
            const res = await fetch(`${VAST_API_BASE}/instances/${instanceId}/`, { method: 'PUT', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ state: 'running' }) });
            return res.ok;
        } catch { return false; }
    }

    async stop(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
            const res = await fetch(`${VAST_API_BASE}/instances/${instanceId}/`, { method: 'PUT', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ state: 'stopped' }) });
            return res.ok;
        } catch { return false; }
    }

    async terminate(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
            const res = await fetch(`${VAST_API_BASE}/instances/${instanceId}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${this.apiKey}` } });
            return res.ok;
        } catch { return false; }
    }

    async getMetrics(instanceId: string): Promise<{ gpuUtilization: number; memoryUsed: number; temperature: number; powerDraw: number } | null> {
        // Vast.ai doesn't expose live GPU metrics via their API
        void instanceId;
        return null;
    }
}

export const vastProvider = new VastProvider();
