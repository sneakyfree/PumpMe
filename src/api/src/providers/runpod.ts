/**
 * RunPod Provider — GPU provisioning via RunPod serverless/pods
 *
 * API docs: https://docs.runpod.io/reference
 * Provides H100, A100, and other enterprise GPUs with fast cold-start times.
 */

import type { GpuProvider, ProvisionRequest, ProvisionResult, ProviderHealth, ProviderCapabilities, GpuInstance } from '../types/provider.js';
import { logger } from '../lib/logger.js';

const RUNPOD_API_BASE = 'https://api.runpod.io/graphql';

export class RunPodProvider implements GpuProvider {
    readonly slug = 'runpod';
    readonly name = 'RunPod';
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.RUNPOD_API_KEY || '';
        if (!this.apiKey) {
            logger.warn('RUNPOD_API_KEY not set — RunPod provider disabled');
        }
    }

    private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
        const response = await fetch(RUNPOD_API_BASE, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json() as { data: T; errors?: Array<{ message: string }> };
        if (data.errors) throw new Error(data.errors[0].message);
        return data.data;
    }

    async healthCheck(): Promise<ProviderHealth> {
        if (!this.apiKey) {
            return { provider: this.slug, isHealthy: false, latencyMs: 0, lastCheck: new Date(), availableGpus: [], error: 'RUNPOD_API_KEY not configured' };
        }
        const start = Date.now();
        try {
            const data = await this.graphql<{ gpuTypes: Array<{ id: string; displayName: string; memoryInGb: number; securePrice: number }> }>(`
        query { gpuTypes { id displayName memoryInGb securePrice } }
      `);
            return {
                provider: this.slug, isHealthy: true, latencyMs: Date.now() - start, lastCheck: new Date(),
                availableGpus: data.gpuTypes.map(gpu => ({ type: gpu.displayName, available: 1, pricePerHour: gpu.securePrice })),
            };
        } catch (err) {
            return { provider: this.slug, isHealthy: false, latencyMs: Date.now() - start, lastCheck: new Date(), availableGpus: [], error: String(err) };
        }
    }

    async getCapabilities(): Promise<ProviderCapabilities> {
        return {
            provider: this.slug, name: this.name,
            gpuTypes: ['RTX 4090', 'A100 80GB', 'H100 80GB', 'H100 SXM'],
            regions: ['us-east', 'us-west', 'eu-central'],
            supportsPreloadedModels: true, supportsPause: true, supportsSnapshot: false,
            minPricePerHour: 0.44, maxPricePerHour: 4.49,
        };
    }

    async getAvailability(): Promise<{ type: string; available: number; pricePerHour: number; region: string }[]> {
        const health = await this.healthCheck();
        return health.availableGpus.map(g => ({ ...g, region: 'global' }));
    }

    async provision(request: ProvisionRequest): Promise<ProvisionResult> {
        if (!this.apiKey) return { success: false, error: 'RUNPOD_API_KEY not configured' };
        try {
            const data = await this.graphql<{
                podFindAndDeployOnDemand: {
                    id: string;
                    desiredStatus: string;
                    runtime: { ports: Array<{ ip: string; publicPort: number }> } | null;
                    machine: { gpuDisplayName: string } | null;
                };
            }>(`
        mutation($input: PodFindAndDeployOnDemandInput!) {
          podFindAndDeployOnDemand(input: $input) { id desiredStatus runtime { ports { ip publicPort } } machine { gpuDisplayName } }
        }
      `, {
                input: {
                    name: `pumpme-${Date.now()}`,
                    imageName: 'runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel-ubuntu22.04',
                    gpuTypeId: request.gpuType || 'NVIDIA GeForce RTX 4090',
                    gpuCount: request.gpuCount || 1,
                    volumeInGb: 20, containerDiskInGb: 20,
                    startJupyter: true, startSsh: true,
                },
            });

            const pod = data.podFindAndDeployOnDemand;
            const accessUrl = pod.runtime?.ports?.[0] ? `http://${pod.runtime.ports[0].ip}:${pod.runtime.ports[0].publicPort}` : '';

            return {
                success: true,
                instance: {
                    id: pod.id, provider: this.slug, providerInstanceId: pod.id,
                    gpuType: pod.machine?.gpuDisplayName || request.gpuType || 'RTX 4090',
                    gpuCount: request.gpuCount || 1, vramGb: 24,
                    status: 'provisioning', pricePerHour: 0, createdAt: new Date(), accessUrl,
                },
            };
        } catch (err) {
            logger.error('RunPod provision error:', err);
            return { success: false, error: String(err) };
        }
    }

    async getStatus(instanceId: string): Promise<GpuInstance | null> {
        if (!this.apiKey) return null;
        try {
            const data = await this.graphql<{
                pod: { id: string; desiredStatus: string; runtime: { uptimeInSeconds: number } | null; machine: { gpuDisplayName: string } | null };
            }>(`query { pod(input: { podId: "${instanceId}" }) { id desiredStatus runtime { uptimeInSeconds } machine { gpuDisplayName } } }`);

            const statusMap: Record<string, GpuInstance['status']> = { RUNNING: 'running', STARTING: 'provisioning', STOPPED: 'stopped', EXITED: 'stopped' };
            return {
                id: instanceId, provider: this.slug, providerInstanceId: instanceId,
                gpuType: data.pod.machine?.gpuDisplayName || 'unknown', gpuCount: 1, vramGb: 24,
                status: statusMap[data.pod.desiredStatus] || 'pending', pricePerHour: 0, createdAt: new Date(),
            };
        } catch { return null; }
    }

    async start(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try { await this.graphql(`mutation { podResume(input: { podId: "${instanceId}", gpuCount: 1 }) { id } }`); return true; } catch { return false; }
    }

    async stop(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try { await this.graphql(`mutation { podStop(input: { podId: "${instanceId}" }) { id } }`); return true; } catch { return false; }
    }

    async terminate(instanceId: string): Promise<boolean> {
        if (!this.apiKey) return false;
        try { await this.graphql(`mutation { podTerminate(input: { podId: "${instanceId}" }) }`); return true; } catch { return false; }
    }

    async getMetrics(_instanceId: string): Promise<{ gpuUtilization: number; memoryUsed: number; temperature: number; powerDraw: number } | null> {
        // RunPod exposes metrics via their dashboard but not yet via GraphQL
        return null;
    }
}

export const runpodProvider = new RunPodProvider();
