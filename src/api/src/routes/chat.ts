/**
 * PumpMe Chat Router
 * Provides AI assistance for GPU compute questions
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface ChatRequest {
    message: string;
    session_id?: string;
}

const KNOWLEDGE: Record<string, string> = {
    gpu: "We offer H100, A100, RTX 4090/5090, and B300 GPUs. For inference, start with our 4090 tier ($0.59/hr). For training, use H100 8x cluster for maximum throughput.",
    pricing: "Pay per minute with no hour blocks. Pump Burst starts at $0.59/hr for 4090s, $3.99/hr for H100 8x. VPN labs start at $49/mo with included hours.",
    model: "Every major model is pre-loaded: Llama 3.3-70B, Qwen 2.5-72B, DeepSeek-V3, Mistral Large. No download wait—instant access.",
    security: "Your data never leaves your private session. Models run locally on your rented GPU. We don't train on your data—ever.",
    speed: "Local GPU inference is 10-30x faster than cloud APIs. Feel the difference in 5 minutes free Beast Mode.",
    start: "Click 'Start Session', select GPU tier, choose a pre-loaded model, and you're live in under 60 seconds. No terminal required.",
};

router.post('/', async (req: Request, res: Response) => {
    const { message, session_id } = req.body as ChatRequest;
    const msg = message.toLowerCase();

    let response: string;

    if (msg.includes('gpu') || msg.includes('hardware') || msg.includes('h100') || msg.includes('4090')) {
        response = KNOWLEDGE.gpu;
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('pay')) {
        response = KNOWLEDGE.pricing;
    } else if (msg.includes('model') || msg.includes('llama') || msg.includes('qwen')) {
        response = KNOWLEDGE.model;
    } else if (msg.includes('security') || msg.includes('privacy') || msg.includes('data')) {
        response = KNOWLEDGE.security;
    } else if (msg.includes('fast') || msg.includes('speed') || msg.includes('latency')) {
        response = KNOWLEDGE.speed;
    } else if (msg.includes('start') || msg.includes('begin') || msg.includes('how')) {
        response = KNOWLEDGE.start;
    } else {
        response = "I can help with: GPU options, pricing, pre-loaded models, security, speed comparisons, and getting started. What would you like to know?";
    }

    res.json({
        response,
        session_id: session_id || `sess_${Date.now()}`,
    });
});

export default router;
