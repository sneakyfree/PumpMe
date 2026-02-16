import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function ImageGenPage({ onNavigate }: Props) {
    const [prompt, setPrompt] = useState('A futuristic city skyline at sunset, cyberpunk style, neon lights');
    const [model, setModel] = useState('sdxl-turbo');
    const [size, setSize] = useState('1024x1024');
    const [steps, setSteps] = useState(20);

    const models = [
        { id: 'sdxl-turbo', name: 'SDXL Turbo', speed: '~2s', cost: '$0.02/img' },
        { id: 'sdxl-1.0', name: 'SDXL 1.0', speed: '~8s', cost: '$0.04/img' },
        { id: 'flux-dev', name: 'FLUX.1-dev', speed: '~12s', cost: '$0.05/img' },
        { id: 'flux-schnell', name: 'FLUX.1-schnell', speed: '~3s', cost: '$0.02/img' },
    ];

    const sizes = ['512x512', '768x768', '1024x1024', '1024x1536', '1536x1024'];
    const selected = models.find(m => m.id === model);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0' }}>🎨 Image Generation</h1>

            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="Describe the image you want to generate..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Model</label>
                    <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Size</label>
                    <select value={size} onChange={e => setSize(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Steps: {steps}</label>
                    <input type="range" min={1} max={50} value={steps} onChange={e => setSteps(Number(e.target.value))} style={{ width: '100%', marginTop: '0.3rem' }} />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>🎨 Generate Image</button>

            {/* Preview placeholder */}
            <div style={{ aspectRatio: size === '1024x1536' ? '2/3' : size === '1536x1024' ? '3/2' : '1/1', maxHeight: '300px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🖼️</div>
                    <div style={{ fontSize: '0.75rem' }}>Generated image will appear here</div>
                    <div style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>{size} · {selected?.speed} · {selected?.cost}</div>
                </div>
            </div>
        </div>
    );
}
