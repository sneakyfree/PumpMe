import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function MultiModalPage({ onNavigate }: Props) {
    const [mode, setMode] = useState<'vision' | 'audio' | 'document'>('vision');
    const [prompt, setPrompt] = useState('');

    const modes = [
        { id: 'vision' as const, icon: '👁️', label: 'Vision', desc: 'Analyze images, charts, screenshots', models: ['llama-3.2-90b-vision', 'llava-1.6-34b'], accepts: '.png, .jpg, .webp' },
        { id: 'audio' as const, icon: '🎵', label: 'Audio', desc: 'Transcribe and analyze audio files', models: ['whisper-large-v3', 'distil-whisper'], accepts: '.mp3, .wav, .m4a' },
        { id: 'document' as const, icon: '📄', label: 'Document', desc: 'Extract info from PDFs and docs', models: ['llama-3.1-70b', 'mistral-large'], accepts: '.pdf, .docx, .txt' },
    ];

    const active = modes.find(m => m.id === mode)!;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <h1 style={{ margin: '1rem 0' }}>🔮 Multi-Modal</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {modes.map(m => (
                    <div key={m.id} onClick={() => setMode(m.id)} style={{ textAlign: 'center', padding: '0.75rem', background: mode === m.id ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${mode === m.id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{m.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.label}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{m.desc}</div>
                    </div>
                ))}
            </div>

            {/* Upload area */}
            <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📁</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Drop {active.label.toLowerCase()} file here or click to upload</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.2rem' }}>Accepts: {active.accepts}</div>
            </div>

            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} placeholder={`Describe what to do with the ${active.label.toLowerCase()}...`} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <select style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                    {active.models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button className="btn btn-primary" style={{ flexShrink: 0 }}>Analyze →</button>
            </div>

            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center' }}>Supports up to 20MB per file · Results include structured output</div>
        </div>
    );
}
