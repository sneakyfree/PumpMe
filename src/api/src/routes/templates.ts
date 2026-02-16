/**
 * Session Templates Routes — reusable GPU session configurations
 *
 * FEAT-172: Save and reuse session setups
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

interface SessionTemplate {
    id: string;
    userId: string;
    name: string;
    description: string;
    config: { gpuType: string; provider: string; modelId: string; envVars: Record<string, string>; autoTerminateMinutes: number; };
    isPublic: boolean;
    usageCount: number;
    createdAt: string;
}

// In-memory store (in production, use DB)
const templates: SessionTemplate[] = [
    // Built-in templates
    { id: 'tpl-llama70b', userId: 'system', name: 'Llama 3.1 70B Chat', description: 'Production-ready Llama 3.1 70B for chat workloads', config: { gpuType: 'A100 80GB', provider: 'Vast.ai', modelId: 'meta-llama/Llama-3.1-70B-Instruct', envVars: { MAX_TOKENS: '4096' }, autoTerminateMinutes: 480 }, isPublic: true, usageCount: 1250, createdAt: '2026-01-15T00:00:00Z' },
    { id: 'tpl-sdxl', userId: 'system', name: 'SDXL Image Generation', description: 'Stable Diffusion XL for high-quality image generation', config: { gpuType: 'RTX 4090', provider: 'RunPod', modelId: 'stabilityai/stable-diffusion-xl-base-1.0', envVars: { STEPS: '30' }, autoTerminateMinutes: 120 }, isPublic: true, usageCount: 890, createdAt: '2026-01-20T00:00:00Z' },
    { id: 'tpl-mistral', userId: 'system', name: 'Mistral 7B Fast', description: 'Lightweight Mistral 7B for fast inference', config: { gpuType: 'RTX 3090', provider: 'Vast.ai', modelId: 'mistralai/Mistral-7B-Instruct-v0.3', envVars: {}, autoTerminateMinutes: 240 }, isPublic: true, usageCount: 2100, createdAt: '2026-01-10T00:00:00Z' },
    { id: 'tpl-codellama', userId: 'system', name: 'Code Llama 34B', description: 'Optimized for code generation and assistance', config: { gpuType: 'A6000', provider: 'RunPod', modelId: 'codellama/CodeLlama-34b-Instruct-hf', envVars: { CONTEXT_LENGTH: '16384' }, autoTerminateMinutes: 360 }, isPublic: true, usageCount: 670, createdAt: '2026-01-25T00:00:00Z' },
];

// GET /api/templates — list templates
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId?: string }).userId;
    const publicTemplates = templates.filter(t => t.isPublic);
    const userTemplates = userId ? templates.filter(t => t.userId === userId && !t.isPublic) : [];
    res.json({ success: true, data: { public: publicTemplates, personal: userTemplates } });
}));

// POST /api/templates — create template
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { name, description, config, isPublic } = req.body;

    if (!name || !config?.gpuType || !config?.modelId) {
        res.status(400).json({ success: false, error: { message: 'Name, gpuType, and modelId required' } });
        return;
    }

    const userCount = templates.filter(t => t.userId === userId).length;
    if (userCount >= 20) {
        res.status(400).json({ success: false, error: { message: 'Maximum 20 templates per user' } });
        return;
    }

    const template: SessionTemplate = {
        id: `tpl-${crypto.randomBytes(6).toString('hex')}`,
        userId,
        name,
        description: description || '',
        config: { gpuType: config.gpuType, provider: config.provider || 'Any', modelId: config.modelId, envVars: config.envVars || {}, autoTerminateMinutes: config.autoTerminateMinutes || 240 },
        isPublic: isPublic || false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    };

    templates.push(template);
    res.status(201).json({ success: true, data: { template } });
}));

// DELETE /api/templates/:id — delete template
router.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const idx = templates.findIndex(t => t.id === req.params.id && t.userId === userId);
    if (idx === -1) { res.status(404).json({ success: false, error: { message: 'Template not found or not owned by you' } }); return; }
    templates.splice(idx, 1);
    res.json({ success: true, data: { message: 'Template deleted' } });
}));

// POST /api/templates/:id/use — mark template as used
router.post('/:id/use', asyncHandler(async (req: Request, res: Response) => {
    const template = templates.find(t => t.id === req.params.id);
    if (!template) { res.status(404).json({ success: false, error: { message: 'Template not found' } }); return; }
    template.usageCount++;
    res.json({ success: true, data: { config: template.config } });
}));

export default router;
