/**
 * GPU Marketplace Routes — browse available GPU instances
 *
 * FEAT-160: Real-time GPU availability and pricing
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

interface GpuListing {
    id: string;
    provider: string;
    gpuType: string;
    gpuCount: number;
    vramGb: number;
    cpuCores: number;
    ramGb: number;
    storageGb: number;
    pricePerHour: number;
    region: string;
    availability: 'available' | 'limited' | 'sold_out';
    reliability: number;
    dlPerf: number; // Deep learning perf score
}

// Mock GPU listings (in production, fetched from provider APIs)
const GPU_LISTINGS: GpuListing[] = [
    { id: 'v-a100-80', provider: 'Vast.ai', gpuType: 'A100 80GB', gpuCount: 1, vramGb: 80, cpuCores: 16, ramGb: 64, storageGb: 200, pricePerHour: 1.10, region: 'US East', availability: 'available', reliability: 99.2, dlPerf: 312 },
    { id: 'v-a100-40', provider: 'Vast.ai', gpuType: 'A100 40GB', gpuCount: 1, vramGb: 40, cpuCores: 12, ramGb: 48, storageGb: 150, pricePerHour: 0.80, region: 'US East', availability: 'available', reliability: 99.0, dlPerf: 275 },
    { id: 'v-rtx4090', provider: 'Vast.ai', gpuType: 'RTX 4090', gpuCount: 1, vramGb: 24, cpuCores: 8, ramGb: 32, storageGb: 100, pricePerHour: 0.45, region: 'US West', availability: 'available', reliability: 98.5, dlPerf: 195 },
    { id: 'v-rtx3090', provider: 'Vast.ai', gpuType: 'RTX 3090', gpuCount: 1, vramGb: 24, cpuCores: 8, ramGb: 32, storageGb: 100, pricePerHour: 0.30, region: 'EU West', availability: 'limited', reliability: 97.8, dlPerf: 142 },
    { id: 'r-a100-80', provider: 'RunPod', gpuType: 'A100 80GB', gpuCount: 1, vramGb: 80, cpuCores: 16, ramGb: 64, storageGb: 200, pricePerHour: 1.19, region: 'US Central', availability: 'available', reliability: 99.5, dlPerf: 312 },
    { id: 'r-a6000', provider: 'RunPod', gpuType: 'A6000', gpuCount: 1, vramGb: 48, cpuCores: 12, ramGb: 48, storageGb: 150, pricePerHour: 0.65, region: 'US Central', availability: 'available', reliability: 99.3, dlPerf: 210 },
    { id: 'r-rtx4090', provider: 'RunPod', gpuType: 'RTX 4090', gpuCount: 1, vramGb: 24, cpuCores: 8, ramGb: 32, storageGb: 100, pricePerHour: 0.49, region: 'US East', availability: 'available', reliability: 99.1, dlPerf: 195 },
    { id: 'l-a100-80', provider: 'Lambda Labs', gpuType: 'A100 80GB', gpuCount: 1, vramGb: 80, cpuCores: 30, ramGb: 200, storageGb: 512, pricePerHour: 1.29, region: 'US West', availability: 'limited', reliability: 99.8, dlPerf: 312 },
    { id: 'l-h100', provider: 'Lambda Labs', gpuType: 'H100 80GB', gpuCount: 1, vramGb: 80, cpuCores: 26, ramGb: 200, storageGb: 512, pricePerHour: 2.49, region: 'US West', availability: 'limited', reliability: 99.9, dlPerf: 520 },
    { id: 'v-a100x4', provider: 'Vast.ai', gpuType: 'A100 80GB', gpuCount: 4, vramGb: 320, cpuCores: 64, ramGb: 256, storageGb: 1000, pricePerHour: 4.20, region: 'US East', availability: 'limited', reliability: 98.8, dlPerf: 1200 },
    { id: 'r-h100', provider: 'RunPod', gpuType: 'H100 80GB', gpuCount: 1, vramGb: 80, cpuCores: 24, ramGb: 128, storageGb: 300, pricePerHour: 2.69, region: 'US Central', availability: 'sold_out', reliability: 99.7, dlPerf: 520 },
    { id: 'v-l40s', provider: 'Vast.ai', gpuType: 'L40S', gpuCount: 1, vramGb: 48, cpuCores: 12, ramGb: 64, storageGb: 200, pricePerHour: 0.75, region: 'EU West', availability: 'available', reliability: 98.9, dlPerf: 233 },
];

// GET /api/marketplace — list available GPUs
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    let listings = [...GPU_LISTINGS];

    // Filters
    const { provider, gpu, minVram, maxPrice, region, sort, availability } = req.query;
    if (provider) listings = listings.filter(l => l.provider.toLowerCase().includes((provider as string).toLowerCase()));
    if (gpu) listings = listings.filter(l => l.gpuType.toLowerCase().includes((gpu as string).toLowerCase()));
    if (minVram) listings = listings.filter(l => l.vramGb >= Number(minVram));
    if (maxPrice) listings = listings.filter(l => l.pricePerHour <= Number(maxPrice));
    if (region) listings = listings.filter(l => l.region.toLowerCase().includes((region as string).toLowerCase()));
    if (availability && availability !== 'all') listings = listings.filter(l => l.availability === availability);

    // Sort
    if (sort === 'price_asc') listings.sort((a, b) => a.pricePerHour - b.pricePerHour);
    else if (sort === 'price_desc') listings.sort((a, b) => b.pricePerHour - a.pricePerHour);
    else if (sort === 'vram') listings.sort((a, b) => b.vramGb - a.vramGb);
    else if (sort === 'perf') listings.sort((a, b) => b.dlPerf - a.dlPerf);
    else listings.sort((a, b) => a.pricePerHour - b.pricePerHour); // default: price asc

    res.json({
        success: true,
        data: {
            listings,
            total: listings.length,
            providers: [...new Set(GPU_LISTINGS.map(l => l.provider))],
            regions: [...new Set(GPU_LISTINGS.map(l => l.region))],
            priceRange: { min: Math.min(...GPU_LISTINGS.map(l => l.pricePerHour)), max: Math.max(...GPU_LISTINGS.map(l => l.pricePerHour)) },
        },
    });
}));

// GET /api/marketplace/estimate — cost estimator
router.get('/estimate', asyncHandler(async (req: Request, res: Response) => {
    const { gpuId, hours, sessions } = req.query;
    const gpu = GPU_LISTINGS.find(l => l.id === gpuId);
    if (!gpu) { res.status(404).json({ success: false, error: { message: 'GPU not found' } }); return; }

    const h = Number(hours) || 1;
    const s = Number(sessions) || 1;
    const subtotal = gpu.pricePerHour * h * s;
    const platformFee = subtotal * 0.05; // 5% platform fee
    const total = subtotal + platformFee;

    res.json({
        success: true,
        data: {
            gpu: { id: gpu.id, type: gpu.gpuType, provider: gpu.provider },
            hours: h,
            sessions: s,
            pricePerHour: gpu.pricePerHour,
            subtotal: Math.round(subtotal * 100) / 100,
            platformFee: Math.round(platformFee * 100) / 100,
            total: Math.round(total * 100) / 100,
            savings: { monthly: Math.round(total * 30 * 0.15 * 100) / 100, yearly: Math.round(total * 365 * 0.20 * 100) / 100 },
        },
    });
}));

export default router;
