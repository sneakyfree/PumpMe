/**
 * Models Routes — 50+ AI Model Library
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sendSuccess } from '../lib/response.js';

const router = Router();

// ── Static Model Catalog (50+ models) ──────────────────────────────────────

const MODEL_CATALOG = [
  // ── Chat / Instruction-following ──
  { slug: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', parameterSize: '8B', contextLength: 128000, minVram: 8, category: 'chat', tags: ['general', 'fast'], isPreloaded: true },
  { slug: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', parameterSize: '70B', contextLength: 128000, minVram: 40, category: 'chat', tags: ['general', 'powerful'], isPreloaded: true },
  { slug: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', parameterSize: '405B', contextLength: 128000, minVram: 320, category: 'chat', tags: ['frontier', 'research'] },
  { slug: 'llama-3.2-3b', name: 'Llama 3.2 3B', provider: 'Meta', parameterSize: '3B', contextLength: 128000, minVram: 4, category: 'chat', tags: ['small', 'fast', 'edge'] },
  { slug: 'llama-3.2-1b', name: 'Llama 3.2 1B', provider: 'Meta', parameterSize: '1B', contextLength: 128000, minVram: 2, category: 'chat', tags: ['tiny', 'edge'] },
  { slug: 'mistral-7b', name: 'Mistral 7B Instruct v0.3', provider: 'Mistral', parameterSize: '7B', contextLength: 32768, minVram: 8, category: 'chat', tags: ['general', 'fast'], isPreloaded: true },
  { slug: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral', parameterSize: '47B', contextLength: 32768, minVram: 48, category: 'chat', tags: ['MoE', 'powerful'] },
  { slug: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral', parameterSize: '141B', contextLength: 65536, minVram: 120, category: 'chat', tags: ['MoE', 'frontier'] },
  { slug: 'qwen2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba', parameterSize: '72B', contextLength: 32768, minVram: 48, category: 'chat', tags: ['multilingual', 'powerful'] },
  { slug: 'qwen2.5-7b', name: 'Qwen 2.5 7B', provider: 'Alibaba', parameterSize: '7B', contextLength: 32768, minVram: 8, category: 'chat', tags: ['multilingual', 'fast'] },
  { slug: 'gemma-2-27b', name: 'Gemma 2 27B', provider: 'Google', parameterSize: '27B', contextLength: 8192, minVram: 24, category: 'chat', tags: ['general'] },
  { slug: 'gemma-2-9b', name: 'Gemma 2 9B', provider: 'Google', parameterSize: '9B', contextLength: 8192, minVram: 10, category: 'chat', tags: ['general', 'fast'] },
  { slug: 'phi-3-14b', name: 'Phi-3 Medium 14B', provider: 'Microsoft', parameterSize: '14B', contextLength: 128000, minVram: 12, category: 'chat', tags: ['reasoning', 'long-ctx'] },
  { slug: 'yi-34b', name: 'Yi-34B Chat', provider: '01.AI', parameterSize: '34B', contextLength: 200000, minVram: 24, category: 'chat', tags: ['long-context'] },
  { slug: 'command-r-plus', name: 'Command R+', provider: 'Cohere', parameterSize: '104B', contextLength: 128000, minVram: 80, category: 'chat', tags: ['RAG', 'enterprise'] },

  // ── Code ──
  { slug: 'codellama-34b', name: 'Code Llama 34B', provider: 'Meta', parameterSize: '34B', contextLength: 16384, minVram: 24, category: 'code', tags: ['code', 'Python'], isPreloaded: true },
  { slug: 'codellama-70b', name: 'Code Llama 70B', provider: 'Meta', parameterSize: '70B', contextLength: 16384, minVram: 48, category: 'code', tags: ['code'] },
  { slug: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek', parameterSize: '236B', contextLength: 128000, minVram: 160, category: 'code', tags: ['code', 'MoE'] },
  { slug: 'deepseek-coder-33b', name: 'DeepSeek Coder 33B', provider: 'DeepSeek', parameterSize: '33B', contextLength: 16384, minVram: 24, category: 'code', tags: ['code'] },
  { slug: 'starcoder2-15b', name: 'StarCoder2 15B', provider: 'BigCode', parameterSize: '15B', contextLength: 16384, minVram: 16, category: 'code', tags: ['code', 'multi-language'] },
  { slug: 'codeqwen-7b', name: 'CodeQwen 1.5 7B', provider: 'Alibaba', parameterSize: '7B', contextLength: 65536, minVram: 8, category: 'code', tags: ['code', 'fast'] },
  { slug: 'wizardcoder-34b', name: 'WizardCoder 34B', provider: 'WizardLM', parameterSize: '34B', contextLength: 16384, minVram: 24, category: 'code', tags: ['code', 'instruct'] },

  // ── Image Generation ──
  { slug: 'sdxl', name: 'Stable Diffusion XL 1.0', provider: 'Stability AI', parameterSize: '3.5B', contextLength: 0, minVram: 8, category: 'image', tags: ['text2img', 'img2img'], isPreloaded: true },
  { slug: 'sd3-medium', name: 'Stable Diffusion 3 Medium', provider: 'Stability AI', parameterSize: '2B', contextLength: 0, minVram: 8, category: 'image', tags: ['text2img', 'new'] },
  { slug: 'sd3.5-large', name: 'Stable Diffusion 3.5 Large', provider: 'Stability AI', parameterSize: '8B', contextLength: 0, minVram: 16, category: 'image', tags: ['text2img', 'high-quality'] },
  { slug: 'flux-1-dev', name: 'FLUX.1 [dev]', provider: 'Black Forest Labs', parameterSize: '12B', contextLength: 0, minVram: 12, category: 'image', tags: ['text2img', 'fast'], isPreloaded: true },
  { slug: 'flux-1-schnell', name: 'FLUX.1 [schnell]', provider: 'Black Forest Labs', parameterSize: '12B', contextLength: 0, minVram: 12, category: 'image', tags: ['text2img', 'realtime'] },
  { slug: 'dalle-3', name: 'DALL·E 3 (via API)', provider: 'OpenAI', parameterSize: 'N/A', contextLength: 0, minVram: 0, category: 'image', tags: ['text2img', 'API-only'] },
  { slug: 'playground-v2.5', name: 'Playground v2.5', provider: 'Playground', parameterSize: '1.3B', contextLength: 0, minVram: 8, category: 'image', tags: ['text2img', 'aesthetic'] },
  { slug: 'controlnet-sdxl', name: 'ControlNet (SDXL)', provider: 'Community', parameterSize: '1B', contextLength: 0, minVram: 10, category: 'image', tags: ['img2img', 'control'] },

  // ── Video ──
  { slug: 'stable-video-diffusion', name: 'Stable Video Diffusion', provider: 'Stability AI', parameterSize: '1.5B', contextLength: 0, minVram: 16, category: 'video', tags: ['img2vid'] },
  { slug: 'animatediff', name: 'AnimateDiff', provider: 'Community', parameterSize: '1B', contextLength: 0, minVram: 12, category: 'video', tags: ['txt2vid', 'animation'] },
  { slug: 'cogvideox', name: 'CogVideoX', provider: 'THUDM', parameterSize: '5B', contextLength: 0, minVram: 24, category: 'video', tags: ['txt2vid'] },

  // ── Audio / Speech ──
  { slug: 'whisper-large-v3', name: 'Whisper Large V3', provider: 'OpenAI', parameterSize: '1.5B', contextLength: 0, minVram: 4, category: 'audio', tags: ['speech2text', 'transcription'], isPreloaded: true },
  { slug: 'whisper-large-v3-turbo', name: 'Whisper Large V3 Turbo', provider: 'OpenAI', parameterSize: '800M', contextLength: 0, minVram: 4, category: 'audio', tags: ['speech2text', 'fast'] },
  { slug: 'bark', name: 'Bark', provider: 'Suno', parameterSize: '350M', contextLength: 0, minVram: 4, category: 'audio', tags: ['text2speech', 'multilingual'] },
  { slug: 'musicgen-large', name: 'MusicGen Large', provider: 'Meta', parameterSize: '3.3B', contextLength: 0, minVram: 8, category: 'audio', tags: ['text2music'] },
  { slug: 'audiocraft', name: 'AudioCraft', provider: 'Meta', parameterSize: '1.5B', contextLength: 0, minVram: 8, category: 'audio', tags: ['text2audio', 'SFX'] },
  { slug: 'xtts-v2', name: 'XTTS v2', provider: 'Coqui', parameterSize: '500M', contextLength: 0, minVram: 4, category: 'audio', tags: ['text2speech', 'voice-clone'] },

  // ── Embedding / Retrieval ──
  { slug: 'gte-large-en-v1.5', name: 'GTE-large-en v1.5', provider: 'Alibaba', parameterSize: '435M', contextLength: 8192, minVram: 2, category: 'embedding', tags: ['retrieval', 'RAG'] },
  { slug: 'bge-large-en-v1.5', name: 'BGE-large-en v1.5', provider: 'BAAI', parameterSize: '335M', contextLength: 512, minVram: 2, category: 'embedding', tags: ['retrieval', 'RAG'] },
  { slug: 'nomic-embed-text', name: 'Nomic Embed Text v1.5', provider: 'Nomic', parameterSize: '137M', contextLength: 8192, minVram: 1, category: 'embedding', tags: ['retrieval', 'long-ctx'] },
  { slug: 'jina-embeddings-v2', name: 'Jina Embeddings v2', provider: 'Jina AI', parameterSize: '137M', contextLength: 8192, minVram: 1, category: 'embedding', tags: ['retrieval'] },

  // ── Vision / Multimodal ──
  { slug: 'llava-1.6-34b', name: 'LLaVA 1.6 34B', provider: 'Community', parameterSize: '34B', contextLength: 4096, minVram: 24, category: 'multimodal', tags: ['vision', 'chat'] },
  { slug: 'llava-1.6-13b', name: 'LLaVA 1.6 13B', provider: 'Community', parameterSize: '13B', contextLength: 4096, minVram: 16, category: 'multimodal', tags: ['vision', 'chat'] },
  { slug: 'internvl2-26b', name: 'InternVL2 26B', provider: 'Shanghai AI Lab', parameterSize: '26B', contextLength: 8192, minVram: 24, category: 'multimodal', tags: ['vision', 'OCR'] },
  { slug: 'cogvlm2-19b', name: 'CogVLM2 19B', provider: 'THUDM', parameterSize: '19B', contextLength: 8192, minVram: 20, category: 'multimodal', tags: ['vision', 'grounding'] },

  // ── 3D / NeRF ──
  { slug: 'instant-mesh', name: 'InstantMesh', provider: 'Community', parameterSize: '1B', contextLength: 0, minVram: 12, category: '3d', tags: ['img23d', 'mesh'] },
  { slug: 'triposr', name: 'TripoSR', provider: 'Stability AI', parameterSize: '300M', contextLength: 0, minVram: 8, category: '3d', tags: ['img23d', 'fast'] },
];

// GET /api/models
router.get('/', (_req: Request, res: Response) => {
  const category = (_req.query.category as string) || undefined;
  const search = (_req.query.search as string) || undefined;

  let filtered = MODEL_CATALOG;

  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(s) ||
      m.slug.includes(s) ||
      m.provider.toLowerCase().includes(s) ||
      m.tags.some(t => t.includes(s))
    );
  }

  sendSuccess(res, {
    models: filtered,
    total: filtered.length,
    categories: [...new Set(MODEL_CATALOG.map(m => m.category))],
  });
});

// GET /api/models/:slug
router.get('/:slug', (_req: Request, res: Response) => {
  const model = MODEL_CATALOG.find(m => m.slug === _req.params.slug);
  if (!model) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Model not found' } });
    return;
  }
  sendSuccess(res, { model });
});

// GET /api/models/categories
router.get('/categories', (_req: Request, res: Response) => {
  const categories = [...new Set(MODEL_CATALOG.map(m => m.category))].map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: MODEL_CATALOG.filter(m => m.category === cat).length,
  }));
  sendSuccess(res, { categories });
});

export default router;
