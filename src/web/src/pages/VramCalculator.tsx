/**
 * VRAM Calculator — estimate GPU memory requirements for any model
 *
 * Uses parameter count, quantization level, and context length to calculate
 * VRAM needs. Helps users pick the right GPU tier before launching.
 *
 * FEAT-062
 */

import { useState } from 'react';
import './VramCalculator.css';

interface VramEstimate {
    baseVram: number;       // GB for model weights
    kvCacheVram: number;    // GB for KV cache at context length
    overheadVram: number;   // GB for framework overhead
    totalVram: number;      // Total required VRAM
    recommended: string;    // Recommended GPU tier
    fits: { name: string; vram: number; ok: boolean }[];
}

// Quantization multipliers (bytes per parameter)
const QUANT_BPP: Record<string, number> = {
    'FP32': 4.0,
    'FP16': 2.0,
    'BF16': 2.0,
    'INT8': 1.0,
    'INT4 (GPTQ/AWQ)': 0.5,
    'GGUF Q4_K_M': 0.56,
    'GGUF Q5_K_M': 0.68,
    'GGUF Q6_K': 0.82,
    'GGUF Q8_0': 1.0,
};

const GPU_OPTIONS = [
    { name: 'RTX 4090', vram: 24 },
    { name: 'RTX 5090', vram: 32 },
    { name: 'A100 40GB', vram: 40 },
    { name: 'A100 80GB', vram: 80 },
    { name: 'H100 80GB', vram: 80 },
    { name: '2x H100 NVLink', vram: 160 },
    { name: '8x H100 NVLink', vram: 640 },
    { name: 'B300 192GB', vram: 192 },
    { name: '8x B300', vram: 1536 },
];

const PRESETS = [
    { label: 'Llama 3 8B', params: 8, context: 8192 },
    { label: 'Llama 3 70B', params: 70, context: 8192 },
    { label: 'Llama 3.1 405B', params: 405, context: 131072 },
    { label: 'Mistral 7B', params: 7.24, context: 32768 },
    { label: 'Mixtral 8x7B', params: 46.7, context: 32768 },
    { label: 'Qwen 2.5 72B', params: 72, context: 131072 },
    { label: 'DeepSeek V3', params: 671, context: 131072 },
    { label: 'Stable Diffusion XL', params: 6.6, context: 0 },
];

function calculateVram(paramsBillions: number, quant: string, contextLength: number): VramEstimate {
    const bpp = QUANT_BPP[quant] || 2.0;

    // Model weights
    const baseVram = (paramsBillions * 1e9 * bpp) / (1024 ** 3);

    // KV cache estimate: 2 * layers * headDim * numHeads * contextLen * bytesPerParam
    // Simplified: ~0.5 bytes per parameter per 1K context tokens for FP16
    const kvCacheVram = contextLength > 0
        ? (paramsBillions * 0.5 * (contextLength / 1024) * Math.min(bpp, 2)) / 1024
        : 0;

    // Framework overhead (CUDA, activation memory, etc.)
    const overheadVram = Math.max(0.5, baseVram * 0.08);

    const totalVram = baseVram + kvCacheVram + overheadVram;

    // Determine recommended tier
    const fits = GPU_OPTIONS.map(gpu => ({
        name: gpu.name,
        vram: gpu.vram,
        ok: gpu.vram >= totalVram,
    }));

    const firstFit = fits.find(f => f.ok);
    const recommended = firstFit?.name || 'Custom multi-GPU setup required';

    return { baseVram, kvCacheVram, overheadVram, totalVram, recommended, fits };
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function VramCalculator({ onNavigate }: Props) {
    const [params, setParams] = useState(70);
    const [quant, setQuant] = useState('INT4 (GPTQ/AWQ)');
    const [context, setContext] = useState(8192);

    const estimate = calculateVram(params, quant, context);

    return (
        <div className="vram-calc">
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1>VRAM Calculator</h1>
            <p className="vram-subtitle">Estimate GPU memory requirements before launching a session</p>

            {/* Presets */}
            <div className="vram-presets">
                {PRESETS.map(p => (
                    <button
                        key={p.label}
                        className="preset-chip"
                        onClick={() => { setParams(p.params); setContext(p.context); }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="vram-grid">
                {/* Inputs */}
                <div className="vram-inputs">
                    <label>
                        <span>Parameters (Billions)</span>
                        <input
                            type="number"
                            value={params}
                            onChange={e => setParams(parseFloat(e.target.value) || 0)}
                            min={0.1}
                            step={0.1}
                        />
                    </label>

                    <label>
                        <span>Quantization</span>
                        <select value={quant} onChange={e => setQuant(e.target.value)}>
                            {Object.keys(QUANT_BPP).map(q => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Context Length (tokens)</span>
                        <input
                            type="number"
                            value={context}
                            onChange={e => setContext(parseInt(e.target.value) || 0)}
                            min={0}
                            step={1024}
                        />
                    </label>
                </div>

                {/* Results */}
                <div className="vram-results">
                    <div className="vram-total">
                        <span className="vram-label">Total VRAM Required</span>
                        <span className="vram-value">{estimate.totalVram.toFixed(1)} GB</span>
                    </div>

                    <div className="vram-breakdown">
                        <div className="breakdown-row">
                            <span>Model weights</span>
                            <span>{estimate.baseVram.toFixed(1)} GB</span>
                        </div>
                        <div className="breakdown-row">
                            <span>KV cache</span>
                            <span>{estimate.kvCacheVram.toFixed(1)} GB</span>
                        </div>
                        <div className="breakdown-row">
                            <span>Overhead</span>
                            <span>{estimate.overheadVram.toFixed(1)} GB</span>
                        </div>
                    </div>

                    <div className="vram-recommendation">
                        <span className="vram-label">Recommended GPU</span>
                        <span className="rec-gpu">{estimate.recommended}</span>
                    </div>

                    {/* GPU compatibility list */}
                    <div className="gpu-compat">
                        {estimate.fits.map(gpu => (
                            <div key={gpu.name} className={`gpu-row ${gpu.ok ? 'ok' : 'no'}`}>
                                <span className="gpu-indicator">{gpu.ok ? '✅' : '❌'}</span>
                                <span className="gpu-name">{gpu.name}</span>
                                <span className="gpu-vram">{gpu.vram} GB</span>
                                {gpu.ok && (
                                    <span className="gpu-headroom">
                                        +{(gpu.vram - estimate.totalVram).toFixed(0)} GB free
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => onNavigate('pump')} style={{ marginTop: '1rem', width: '100%' }}>
                        Launch Session →
                    </button>
                </div>
            </div>
        </div>
    );
}
