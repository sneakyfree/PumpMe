import { Router } from 'express';

const router = Router();

// Pre-loaded model library - a key differentiator
const MODEL_LIBRARY = {
  // Language Models
  'llama-3.3-70b': {
    name: 'Llama 3.3 70B',
    category: 'language',
    size: '140GB',
    minGpu: 'A100 80GB',
    description: 'Meta\'s latest open-weight model. Great for coding and reasoning.',
    recommendedFor: ['Coding', 'Analysis', 'Writing'],
  },
  'llama-3.3-405b': {
    name: 'Llama 3.3 405B',
    category: 'language',
    size: '810GB',
    minGpu: '8x H100',
    description: 'The biggest Llama. Frontier-class performance.',
    recommendedFor: ['Complex reasoning', 'Research', 'Enterprise'],
  },
  'qwen-2.5-72b': {
    name: 'Qwen 2.5 72B',
    category: 'language',
    size: '145GB',
    minGpu: 'A100 80GB',
    description: 'Alibaba\'s powerful multilingual model.',
    recommendedFor: ['Multilingual', 'Coding', 'Math'],
  },
  'deepseek-r1': {
    name: 'DeepSeek R1',
    category: 'language',
    size: '130GB',
    minGpu: 'A100 80GB',
    description: 'Reasoning-focused model with chain-of-thought.',
    recommendedFor: ['Math', 'Logic', 'Problem solving'],
  },
  'mistral-large': {
    name: 'Mistral Large',
    category: 'language',
    size: '120GB',
    minGpu: 'A100 80GB',
    description: 'European powerhouse. Fast and capable.',
    recommendedFor: ['General purpose', 'European languages'],
  },

  // Image Generation
  'flux-1-dev': {
    name: 'FLUX.1 Dev',
    category: 'image',
    size: '23GB',
    minGpu: 'RTX 4090',
    description: 'Black Forest Labs\' stunning image generator.',
    recommendedFor: ['Art', 'Design', 'Photography'],
  },
  'sd-3.5-large': {
    name: 'Stable Diffusion 3.5 Large',
    category: 'image',
    size: '16GB',
    minGpu: 'RTX 4090',
    description: 'Stability AI\'s latest. Excellent quality.',
    recommendedFor: ['Art', 'Concept art', 'Illustrations'],
  },
  'sdxl-turbo': {
    name: 'SDXL Turbo',
    category: 'image',
    size: '6.5GB',
    minGpu: 'RTX 4090',
    description: 'Fast image generation in 1-4 steps.',
    recommendedFor: ['Quick iterations', 'Prototyping'],
  },

  // Video Generation
  'hunyuan-video': {
    name: 'HunyuanVideo',
    category: 'video',
    size: '45GB',
    minGpu: 'H100 80GB',
    description: 'Tencent\'s open-weight video generator.',
    recommendedFor: ['Short videos', 'Animation'],
  },
  'mochi-1': {
    name: 'Mochi 1',
    category: 'video',
    size: '38GB',
    minGpu: 'A100 80GB',
    description: 'Genmo\'s video generation model.',
    recommendedFor: ['Video clips', 'Motion graphics'],
  },

  // Audio
  'whisper-large-v3': {
    name: 'Whisper Large v3',
    category: 'audio',
    size: '3GB',
    minGpu: 'RTX 4090',
    description: 'OpenAI\'s speech recognition. 99+ languages.',
    recommendedFor: ['Transcription', 'Translation', 'Podcasts'],
  },
  'xtts-v2': {
    name: 'XTTS v2',
    category: 'audio',
    size: '2GB',
    minGpu: 'RTX 4090',
    description: 'Coqui\'s text-to-speech with voice cloning.',
    recommendedFor: ['Voice synthesis', 'Audiobooks', 'Voiceover'],
  },

  // 3D & Rendering
  'triposr': {
    name: 'TripoSR',
    category: '3d',
    size: '4GB',
    minGpu: 'RTX 4090',
    description: 'Image-to-3D model generation.',
    recommendedFor: ['3D modeling', 'Game assets', 'Prototyping'],
  },

  // Code
  'codellama-70b': {
    name: 'Code Llama 70B',
    category: 'code',
    size: '140GB',
    minGpu: 'A100 80GB',
    description: 'Meta\'s code-specialized Llama.',
    recommendedFor: ['Coding', 'Code review', 'Debugging'],
  },
  'deepseek-coder-v2': {
    name: 'DeepSeek Coder V2',
    category: 'code',
    size: '130GB',
    minGpu: 'A100 80GB',
    description: 'Excellent code model from DeepSeek.',
    recommendedFor: ['Coding', 'Documentation', 'Testing'],
  },
};

// GET /api/models - List all available models
router.get('/', (req, res) => {
  const { category } = req.query;
  
  let models = Object.entries(MODEL_LIBRARY).map(([id, model]) => ({
    id,
    ...model,
  }));
  
  if (category) {
    models = models.filter(m => m.category === category);
  }
  
  res.json({
    models,
    total: models.length,
    categories: ['language', 'image', 'video', 'audio', '3d', 'code'],
    message: 'All models pre-loaded. Zero download time.',
  });
});

// GET /api/models/:id - Get specific model details
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const model = MODEL_LIBRARY[id as keyof typeof MODEL_LIBRARY];
  
  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }
  
  res.json({
    id,
    ...model,
    status: 'ready', // Pre-loaded, no download needed
  });
});

// GET /api/models/recommend - Get model recommendations
router.get('/recommend/:useCase', (req, res) => {
  const { useCase } = req.params;
  
  const recommendations = Object.entries(MODEL_LIBRARY)
    .filter(([id, model]) => 
      model.recommendedFor.some(r => 
        r.toLowerCase().includes(useCase.toLowerCase())
      )
    )
    .map(([id, model]) => ({ id, ...model }));
  
  res.json({
    useCase,
    recommendations,
    message: recommendations.length > 0 
      ? `Found ${recommendations.length} models for ${useCase}`
      : 'No specific recommendations. Try browsing all models.',
  });
});

export default router;
