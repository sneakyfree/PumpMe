import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function FineTuningPage({ onNavigate }: Props) {
    const [model, setModel] = useState('meta-llama/Llama-3.1-8B');
    const [epochs, setEpochs] = useState(3);
    const [lr, setLr] = useState('2e-4');
    const [method, setMethod] = useState('lora');

    const models = [
        { id: 'meta-llama/Llama-3.1-8B', name: 'Llama 3.1 8B', vram: '16GB', cost: '$0.80/hr' },
        { id: 'meta-llama/Llama-3.1-70B', name: 'Llama 3.1 70B', vram: '80GB', cost: '$2.49/hr' },
        { id: 'mistralai/Mistral-7B', name: 'Mistral 7B', vram: '16GB', cost: '$0.60/hr' },
        { id: 'codellama/CodeLlama-7b', name: 'CodeLlama 7B', vram: '16GB', cost: '$0.60/hr' },
    ];

    const selected = models.find(m => m.id === model);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0' }}>🎯 Fine-Tuning</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Fine-tune any supported model with your dataset using LoRA or QLoRA on dedicated GPUs.
            </p>

            {/* Config */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Base Model</label>
                    <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.vram})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        <option value="lora">LoRA (recommended)</option>
                        <option value="qlora">QLoRA (4-bit)</option>
                        <option value="full">Full Fine-Tune</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Epochs: {epochs}</label>
                    <input type="range" min={1} max={10} value={epochs} onChange={e => setEpochs(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Learning Rate</label>
                    <select value={lr} onChange={e => setLr(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        <option value="1e-4">1e-4 (conservative)</option>
                        <option value="2e-4">2e-4 (recommended)</option>
                        <option value="5e-4">5e-4 (aggressive)</option>
                    </select>
                </div>
            </div>

            {/* Dataset upload */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📁</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Drop your dataset here</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>JSONL format · Max 500MB · {"{ \"prompt\": ..., \"completion\": ... }"}</div>
            </div>

            {/* Cost estimate */}
            <div style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>💰 Estimated Cost</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>GPU: </span><strong>{selected?.cost}</strong></div>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Method: </span><strong>{method.toUpperCase()}</strong></div>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Epochs: </span><strong>{epochs}</strong></div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>
                    Final cost depends on dataset size. LoRA typically completes in 30-60 minutes for 10K samples.
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }}>🚀 Start Fine-Tuning Job</button>
        </div>
    );
}
