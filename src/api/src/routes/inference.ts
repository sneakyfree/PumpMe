/**
 * OpenAI-Compatible Inference API — drop-in replacement for OpenAI SDK
 *
 * Supports:
 *   POST /v1/chat/completions
 *   POST /v1/embeddings
 *   GET  /v1/models
 *
 * FEAT-105, FEAT-106, FEAT-107
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { validateApiKey } from '../routes/apiKeys.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * Middleware: authenticate via Bearer API key
 */
async function requireApiKey(req: Request, _res: Response, next: () => void) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('API key required. Use: Authorization: Bearer pm_live_xxx', 401);
    }

    const result = await validateApiKey(authHeader.slice(7));
    if (!result) throw new AppError('Invalid or expired API key', 401);

    (req as Request & { apiUser?: { userId: string; keyId: string } }).apiUser = result;
    next();
}

/**
 * POST /v1/chat/completions — OpenAI-compatible chat endpoint
 */
router.post('/chat/completions', requireApiKey, asyncHandler(async (req: Request, res: Response) => {
    const { model, messages, stream, temperature, max_tokens } = req.body;
    const apiUser = (req as Request & { apiUser?: { userId: string; keyId: string } }).apiUser!;

    if (!model || !messages || !Array.isArray(messages)) {
        throw new AppError('model and messages[] are required', 400);
    }

    // Find user's active session or use default Ollama
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    // Forward to Ollama in OpenAI-compatible format
    const ollamaPayload = {
        model,
        messages,
        stream: stream || false,
        options: {
            temperature: temperature || 0.7,
            num_predict: max_tokens || 2048,
        },
    };

    const requestId = `chatcmpl-${Date.now().toString(36)}`;

    if (stream) {
        // SSE streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ollamaPayload, stream: true }),
            });

            const reader = ollamaRes.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        const text = decoder.decode(value, { stream: true });
                        const lines = text.split('\n').filter(l => l.trim());
                        for (const line of lines) {
                            try {
                                const chunk = JSON.parse(line);
                                const delta = {
                                    id: requestId,
                                    object: 'chat.completion.chunk',
                                    created: Math.floor(Date.now() / 1000),
                                    model,
                                    choices: [{
                                        index: 0,
                                        delta: { content: chunk.message?.content || '' },
                                        finish_reason: chunk.done ? 'stop' : null,
                                    }],
                                };
                                res.write(`data: ${JSON.stringify(delta)}\n\n`);
                            } catch { /* skip malformed lines */ }
                        }
                    }
                }
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (err) {
            logger.error('Ollama streaming error:', err);
            res.write(`data: ${JSON.stringify({ error: { message: 'Inference backend unavailable' } })}\n\n`);
            res.end();
        }
    } else {
        // Non-streaming response
        try {
            const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ollamaPayload),
            });

            const ollamaData = await ollamaRes.json() as { message?: { content?: string; role?: string }; eval_count?: number; prompt_eval_count?: number };

            // Track usage
            const promptTokens = ollamaData.prompt_eval_count || 0;
            const completionTokens = ollamaData.eval_count || 0;

            // Record API usage transaction (fire-and-forget)
            prisma.transaction.create({
                data: {
                    userId: apiUser.userId,
                    amount: 0, // Free tier usage tracking; paid usage calculated by billing
                    type: 'api_usage',
                    description: `API: ${model} — ${promptTokens + completionTokens} tokens (key: ${apiUser.keyId.slice(0, 8)})`,
                },
            }).catch(() => { });

            res.json({
                id: requestId,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: ollamaData.message?.content || '',
                    },
                    finish_reason: 'stop',
                }],
                usage: {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens,
                },
            });
        } catch (err) {
            logger.error('Ollama inference error:', err);
            throw new AppError('Inference backend unavailable. Is a GPU session running?', 503);
        }
    }
}));

/**
 * POST /v1/embeddings — OpenAI-compatible embeddings endpoint
 */
router.post('/embeddings', requireApiKey, asyncHandler(async (req: Request, res: Response) => {
    const { model, input } = req.body;

    if (!model || !input) throw new AppError('model and input are required', 400);

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const inputs = Array.isArray(input) ? input : [input];
    const embeddings = [];

    for (let i = 0; i < inputs.length; i++) {
        try {
            const ollamaRes = await fetch(`${ollamaUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt: inputs[i] }),
            });
            const data = await ollamaRes.json() as { embedding: number[] };
            embeddings.push({ object: 'embedding', index: i, embedding: data.embedding });
        } catch {
            throw new AppError('Embedding model unavailable', 503);
        }
    }

    res.json({
        object: 'list',
        data: embeddings,
        model,
        usage: { prompt_tokens: inputs.join(' ').split(' ').length, total_tokens: inputs.join(' ').split(' ').length },
    });
}));

/**
 * GET /v1/models — list available models (OpenAI format)
 */
router.get('/models', asyncHandler(async (_req: Request, res: Response) => {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    try {
        const ollamaRes = await fetch(`${ollamaUrl}/api/tags`);
        const data = await ollamaRes.json() as { models?: { name: string; size: number; modified_at: string }[] };

        const models = (data.models || []).map(m => ({
            id: m.name,
            object: 'model',
            created: Math.floor(new Date(m.modified_at).getTime() / 1000),
            owned_by: 'pump-me',
        }));

        res.json({ object: 'list', data: models });
    } catch {
        res.json({ object: 'list', data: [] });
    }
}));

/**
 * POST /v1/images/generations — OpenAI-compatible image generation
 *
 * FEAT-108: Image generation endpoint
 */
router.post('/images/generations', requireApiKey, asyncHandler(async (req: Request, res: Response) => {
    const { prompt, model, n, size } = req.body;
    const apiUser = (req as Request & { apiUser?: { userId: string; keyId: string } }).apiUser!;

    if (!prompt) {
        throw new AppError('prompt is required', 400);
    }

    const imageModel = model || 'sdxl';
    const imageCount = Math.min(n || 1, 4); // Max 4 images
    const imageSize = size || '1024x1024';

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const sdUrl = process.env.SD_API_URL; // Stable Diffusion WebUI API

    const images: { url?: string; b64_json?: string }[] = [];

    for (let i = 0; i < imageCount; i++) {
        try {
            if (sdUrl) {
                // Use Stable Diffusion WebUI API (AUTOMATIC1111 / ComfyUI)
                const [widthStr, heightStr] = imageSize.split('x');
                const sdRes = await fetch(`${sdUrl}/sdapi/v1/txt2img`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        negative_prompt: '',
                        width: parseInt(widthStr) || 1024,
                        height: parseInt(heightStr) || 1024,
                        steps: 20,
                        cfg_scale: 7,
                        sampler_name: 'DPM++ 2M Karras',
                    }),
                });
                const sdData = await sdRes.json() as { images?: string[] };
                if (sdData.images?.[0]) {
                    images.push({ b64_json: sdData.images[0] });
                }
            } else {
                // Fallback: try Ollama's multimodal generation (if model supports it)
                const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: imageModel,
                        prompt: `Generate an image: ${prompt}`,
                        stream: false,
                    }),
                });
                const ollamaData = await ollamaRes.json() as { images?: string[]; response?: string };
                if (ollamaData.images?.[0]) {
                    images.push({ b64_json: ollamaData.images[0] });
                } else {
                    // Model doesn't support image gen — return informative error
                    throw new AppError(
                        `Model "${imageModel}" does not support image generation. Configure SD_API_URL for Stable Diffusion, or use an image-capable model.`,
                        422
                    );
                }
            }
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Image generation error:', err);
            throw new AppError('Image generation backend unavailable. Is a GPU session running with an image model?', 503);
        }
    }

    // Track usage
    prisma.transaction.create({
        data: {
            userId: apiUser.userId,
            amount: 0,
            type: 'api_usage',
            description: `Image gen: ${imageModel} — ${imageCount} image(s) (key: ${apiUser.keyId.slice(0, 8)})`,
        },
    }).catch(() => { });

    res.json({
        created: Math.floor(Date.now() / 1000),
        data: images,
    });
}));

export default router;
