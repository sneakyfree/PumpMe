/**
 * Model Detail Page — deep-dive into a specific model's specs, benchmarks, and launch
 *
 * FEAT-064
 */

import { useState } from 'react';
import './ModelDetail.css';

// Same model data as ModelsPage (would come from API in production)
const MODEL_DB: Record<string, {
    name: string; provider: string; params: string; context: number; vram: number;
    category: string; description: string; license: string; huggingFace: string;
    benchmarks: { name: string; score: string }[];
    useCases: string[];
}> = {
    'llama-3.1-405b': {
        name: 'Llama 3.1 405B', provider: 'Meta', params: '405B', context: 131072, vram: 320,
        category: 'chat', description: 'Meta\'s most capable open model. Excels at complex reasoning, multilingual tasks, and code generation. Competitive with GPT-4 on many benchmarks.',
        license: 'Llama 3.1 Community License', huggingFace: 'meta-llama/Llama-3.1-405B-Instruct',
        benchmarks: [
            { name: 'MMLU', score: '88.6%' }, { name: 'HumanEval', score: '89.0%' },
            { name: 'MATH', score: '73.8%' }, { name: 'GSM8K', score: '96.8%' },
        ],
        useCases: ['Complex reasoning', 'Multi-turn dialogue', 'Code generation', 'Research', 'Translation'],
    },
    'llama-3-70b': {
        name: 'Llama 3 70B', provider: 'Meta', params: '70B', context: 8192, vram: 40,
        category: 'chat', description: 'Excellent balance of capability and efficiency. Strong at general tasks, coding, and analysis.',
        license: 'Llama 3 Community License', huggingFace: 'meta-llama/Llama-3-70B-Instruct',
        benchmarks: [
            { name: 'MMLU', score: '82.0%' }, { name: 'HumanEval', score: '81.7%' },
            { name: 'MATH', score: '50.4%' }, { name: 'GSM8K', score: '93.0%' },
        ],
        useCases: ['General assistant', 'Code review', 'Content creation', 'Data analysis'],
    },
    'deepseek-v3': {
        name: 'DeepSeek V3', provider: 'DeepSeek', params: '671B MoE', context: 131072, vram: 320,
        category: 'chat', description: 'Mixture-of-Experts model with 671B total parameters but only 37B active. World-class reasoning and coding at remarkable efficiency.',
        license: 'DeepSeek License', huggingFace: 'deepseek-ai/DeepSeek-V3',
        benchmarks: [
            { name: 'MMLU', score: '87.1%' }, { name: 'HumanEval', score: '92.1%' },
            { name: 'MATH', score: '90.2%' }, { name: 'AIME', score: '39.2%' },
        ],
        useCases: ['Advanced coding', 'Mathematical reasoning', 'Research', 'Complex analysis'],
    },
    'mistral-7b': {
        name: 'Mistral 7B', provider: 'Mistral AI', params: '7.24B', context: 32768, vram: 6,
        category: 'chat', description: 'Exceptionally efficient 7B model that punches above its weight. Great for fast inference and resource-constrained deployments.',
        license: 'Apache 2.0', huggingFace: 'mistralai/Mistral-7B-Instruct-v0.3',
        benchmarks: [
            { name: 'MMLU', score: '62.5%' }, { name: 'HumanEval', score: '32.9%' },
            { name: 'HellaSwag', score: '81.3%' }, { name: 'ARC', score: '60.0%' },
        ],
        useCases: ['Fast chatbot', 'Edge deployment', 'Summarization', 'Classification'],
    },
    'stable-diffusion-xl': {
        name: 'Stable Diffusion XL', provider: 'Stability AI', params: '6.6B', context: 0, vram: 8,
        category: 'image', description: 'State-of-the-art image generation with enhanced detail, composition, and prompt adherence. Supports 1024x1024 native resolution.',
        license: 'CreativeML Open RAIL++-M', huggingFace: 'stabilityai/stable-diffusion-xl-base-1.0',
        benchmarks: [
            { name: 'FID (COCO)', score: '6.63' }, { name: 'CLIP Score', score: '0.317' },
        ],
        useCases: ['Image generation', 'Art creation', 'Design prototyping', 'Marketing assets'],
    },
    'whisper-large-v3': {
        name: 'Whisper Large V3', provider: 'OpenAI', params: '1.55B', context: 0, vram: 4,
        category: 'audio', description: 'Robust multilingual speech recognition supporting 100+ languages with timestamps and voice activity detection.',
        license: 'MIT', huggingFace: 'openai/whisper-large-v3',
        benchmarks: [
            { name: 'WER (English)', score: '2.9%' }, { name: 'WER (Multilingual)', score: '10.1%' },
        ],
        useCases: ['Transcription', 'Translation', 'Podcast processing', 'Meeting notes'],
    },
};

interface Props {
    modelSlug: string;
    onNavigate: (page: string) => void;
}

export default function ModelDetail({ modelSlug, onNavigate }: Props) {
    const [selectedQuant, setSelectedQuant] = useState('INT4 (GPTQ/AWQ)');
    const model = MODEL_DB[modelSlug];

    if (!model) {
        return (
            <div className="model-detail">
                <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
                <h1>Model not found</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>The model "{modelSlug}" doesn't exist in our library.</p>
            </div>
        );
    }

    const quantVram: Record<string, number> = {
        'FP16': model.vram,
        'INT8': model.vram * 0.5,
        'INT4 (GPTQ/AWQ)': model.vram * 0.28,
        'GGUF Q4_K_M': model.vram * 0.3,
    };

    return (
        <div className="model-detail">
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>

            {/* Header */}
            <div className="md-header">
                <div>
                    <span className="md-provider">{model.provider}</span>
                    <h1>{model.name}</h1>
                    <p className="md-desc">{model.description}</p>
                </div>
                <div className="md-actions">
                    <button className="btn btn-primary" onClick={() => onNavigate('pump')}>Use This Model →</button>
                    <button className="btn btn-secondary" onClick={() => onNavigate('vram')}>VRAM Calculator</button>
                </div>
            </div>

            <div className="md-grid">
                {/* Specs */}
                <div className="md-card">
                    <h3>Specifications</h3>
                    <div className="md-specs">
                        <div className="spec-row"><span>Parameters</span><span>{model.params}</span></div>
                        <div className="spec-row"><span>Context Length</span><span>{model.context > 0 ? `${(model.context / 1024).toFixed(0)}K tokens` : 'N/A'}</span></div>
                        <div className="spec-row"><span>Min VRAM (FP16)</span><span>{model.vram} GB</span></div>
                        <div className="spec-row"><span>Category</span><span className="cat-badge">{model.category}</span></div>
                        <div className="spec-row"><span>License</span><span>{model.license}</span></div>
                        <div className="spec-row">
                            <span>HuggingFace</span>
                            <a href={`https://huggingface.co/${model.huggingFace}`} target="_blank" rel="noopener noreferrer" className="hf-link">
                                {model.huggingFace.split('/')[1]}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Benchmarks */}
                <div className="md-card">
                    <h3>Benchmarks</h3>
                    <div className="md-benchmarks">
                        {model.benchmarks.map(b => (
                            <div key={b.name} className="bench-row">
                                <span className="bench-name">{b.name}</span>
                                <span className="bench-score">{b.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quantization options */}
                <div className="md-card">
                    <h3>Quantization Options</h3>
                    <div className="quant-options">
                        {Object.entries(quantVram).map(([q, vram]) => (
                            <button
                                key={q}
                                className={`quant-option ${selectedQuant === q ? 'active' : ''}`}
                                onClick={() => setSelectedQuant(q)}
                            >
                                <span className="quant-name">{q}</span>
                                <span className="quant-vram">~{vram.toFixed(0)} GB VRAM</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Use cases */}
                <div className="md-card">
                    <h3>Best For</h3>
                    <div className="use-cases">
                        {model.useCases.map(uc => (
                            <span key={uc} className="use-tag">{uc}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
