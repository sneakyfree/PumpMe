/**
 * Session Wizard — 5-step pump creation flow
 * 
 * Step 1: Choose product type (Burst / VPN / Home)
 * Step 2: Select GPU tier (Starter / Pro / Beast / Ultra)
 * Step 3: Select model
 * Step 4: Review & confirm
 * Step 5: Provisioning → Active session
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './SessionWizard.css';

const PRODUCT_TYPES = [
    { id: 'burst', name: 'Pump Burst', icon: '⚡', desc: 'Pay per minute, no commitment', price: 'From $0.59/hr' },
    { id: 'vpn', name: 'Pump VPN', icon: '🔒', desc: 'Persistent lab + saved environments', price: '$49/mo + 10hr included' },
    { id: 'home', name: 'Pump Home', icon: '🏠', desc: 'Storage + hosting + inference API', price: '$149/mo + 30hr included' },
];

const GPU_TIERS = [
    { id: 'starter', name: 'Starter', gpu: 'RTX 4090/5090', vram: '24GB', price: '$0.59/hr', color: '#34c759' },
    { id: 'pro', name: 'Pro', gpu: 'A100 40-80GB', vram: '80GB', price: '$1.80/hr', color: '#00d4ff' },
    { id: 'beast', name: 'Beast Mode', gpu: 'H100 80GB', vram: '640GB', price: '$4.20/hr', color: '#7b2ff7' },
    { id: 'ultra', name: 'Ultra', gpu: 'B300', vram: '288GB', price: '$7.20/hr', color: '#ff6b6b' },
];

const POPULAR_MODELS = [
    { id: 'llama-3-70b', name: 'Llama 3.1 70B', category: 'chat', minTier: 'pro' },
    { id: 'mistral-7b', name: 'Mistral 7B', category: 'chat', minTier: 'starter' },
    { id: 'sdxl', name: 'Stable Diffusion XL', category: 'image', minTier: 'starter' },
    { id: 'codellama-34b', name: 'Code Llama 34B', category: 'code', minTier: 'pro' },
    { id: 'flux', name: 'FLUX.1', category: 'image', minTier: 'starter' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder V2', category: 'code', minTier: 'starter' },
    { id: 'whisper-large', name: 'Whisper Large V3', category: 'audio', minTier: 'starter' },
    { id: 'llama-3-405b', name: 'Llama 3.1 405B', category: 'chat', minTier: 'beast' },
];

interface Props {
    onNavigate: (page: string) => void;
}

export default function SessionWizard({ onNavigate }: Props) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [productType, setProductType] = useState('burst');
    const [gpuTier, setGpuTier] = useState('starter');
    const [modelId, setModelId] = useState('');
    const [provisioning, setProvisioning] = useState(false);
    const [error, setError] = useState('');
    const [sessionResult, setSessionResult] = useState<{ id: string; status: string; accessUrl?: string } | null>(null);

    async function handleCreate() {
        setError('');
        setProvisioning(true);
        setStep(5);

        try {
            const res = await api.post<{ session: { id: string; status: string; accessUrl?: string } }>('/sessions/create', {
                tier: gpuTier,
                type: productType,
                modelId: modelId || undefined,
            });

            if (res.success && res.data) {
                setSessionResult(res.data.session);
            } else {
                setError(res.error?.message || 'Failed to create session');
                setStep(4);
            }
        } catch {
            setError('Network error — please try again');
            setStep(4);
        }
        setProvisioning(false);
    }

    const selectedTier = GPU_TIERS.find(t => t.id === gpuTier);
    const selectedProduct = PRODUCT_TYPES.find(p => p.id === productType);

    return (
        <div className="wizard-container">
            <div className="wizard-card">
                {/* Progress */}
                <div className="wizard-progress">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`wizard-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
                            <div className="step-dot">{step > s ? '✓' : s}</div>
                            <span className="step-label">
                                {s === 1 ? 'Type' : s === 2 ? 'GPU' : s === 3 ? 'Model' : s === 4 ? 'Review' : 'Launch'}
                            </span>
                        </div>
                    ))}
                </div>

                {error && <div className="auth-error">{error}</div>}

                {/* Step 1: Product Type */}
                {step === 1 && (
                    <div className="wizard-body">
                        <h2>Choose Your Pump Mode</h2>
                        <div className="option-grid">
                            {PRODUCT_TYPES.map(p => (
                                <button
                                    key={p.id}
                                    className={`option-card ${productType === p.id ? 'selected' : ''}`}
                                    onClick={() => setProductType(p.id)}
                                >
                                    <div className="option-icon">{p.icon}</div>
                                    <div className="option-name">{p.name}</div>
                                    <div className="option-desc">{p.desc}</div>
                                    <div className="option-price">{p.price}</div>
                                </button>
                            ))}
                        </div>
                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
                        </div>
                    </div>
                )}

                {/* Step 2: GPU Tier */}
                {step === 2 && (
                    <div className="wizard-body">
                        <h2>Select GPU Power</h2>
                        <div className="option-grid gpu-grid">
                            {GPU_TIERS.map(t => (
                                <button
                                    key={t.id}
                                    className={`option-card ${gpuTier === t.id ? 'selected' : ''}`}
                                    onClick={() => setGpuTier(t.id)}
                                    style={{ borderColor: gpuTier === t.id ? t.color : undefined }}
                                >
                                    <div className="option-name" style={{ color: t.color }}>{t.name}</div>
                                    <div className="option-desc">{t.gpu}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{t.vram} VRAM</div>
                                    <div className="option-price">{t.price}</div>
                                </button>
                            ))}
                        </div>
                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Model Selection */}
                {step === 3 && (
                    <div className="wizard-body">
                        <h2>Choose a Model</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                            Or bring your own after launching
                        </p>
                        <div className="model-grid">
                            <button
                                className={`model-card ${modelId === '' ? 'selected' : ''}`}
                                onClick={() => setModelId('')}
                            >
                                <div className="model-name">None (Blank Environment)</div>
                                <div className="model-category">BYO Model</div>
                            </button>
                            {POPULAR_MODELS.map(m => (
                                <button
                                    key={m.id}
                                    className={`model-card ${modelId === m.id ? 'selected' : ''}`}
                                    onClick={() => setModelId(m.id)}
                                >
                                    <div className="model-name">{m.name}</div>
                                    <div className="model-category">{m.category}</div>
                                </button>
                            ))}
                        </div>
                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>Next →</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="wizard-body">
                        <h2>Review & Launch</h2>
                        <div className="review-summary">
                            <div className="review-row">
                                <span>Product</span>
                                <span>{selectedProduct?.icon} {selectedProduct?.name}</span>
                            </div>
                            <div className="review-row">
                                <span>GPU Tier</span>
                                <span style={{ color: selectedTier?.color }}>{selectedTier?.name} ({selectedTier?.gpu})</span>
                            </div>
                            <div className="review-row">
                                <span>Model</span>
                                <span>{modelId ? POPULAR_MODELS.find(m => m.id === modelId)?.name || modelId : 'None (BYO)'}</span>
                            </div>
                            <div className="review-row">
                                <span>Rate</span>
                                <span>{selectedTier?.price}</span>
                            </div>
                            <div className="review-row">
                                <span>Your Balance</span>
                                <span>${((user?.creditBalance || 0) / 100).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
                            <button className="btn btn-primary" onClick={handleCreate}>🚀 Launch Session</button>
                        </div>
                    </div>
                )}

                {/* Step 5: Provisioning */}
                {step === 5 && (
                    <div className="wizard-body" style={{ textAlign: 'center' }}>
                        {provisioning ? (
                            <>
                                <div className="provision-spinner">⚡</div>
                                <h2>Provisioning Your GPU...</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)' }}>This usually takes 30-60 seconds</p>
                            </>
                        ) : sessionResult ? (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                                <h2>Session Ready!</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
                                    Session ID: {sessionResult.id}
                                </p>
                                <div className="wizard-actions" style={{ justifyContent: 'center' }}>
                                    <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
                                        Go to Dashboard
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
