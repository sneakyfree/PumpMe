import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Voice { id: string; name: string; style: string; speed: string; languages: string[]; preview: string; }

const VOICES: Voice[] = [
    { id: 'v-1', name: 'Nova', style: 'Professional', speed: 'Medium', languages: ['English', 'Spanish', 'French'], preview: 'A clear, professional voice ideal for presentations and business content.' },
    { id: 'v-2', name: 'Echo', style: 'Conversational', speed: 'Natural', languages: ['English', 'German'], preview: 'Warm and engaging, perfect for podcasts and casual narration.' },
    { id: 'v-3', name: 'Fable', style: 'Narrative', speed: 'Slow', languages: ['English'], preview: 'Rich and expressive, designed for storytelling and audiobooks.' },
    { id: 'v-4', name: 'Onyx', style: 'Authoritative', speed: 'Medium', languages: ['English', 'Japanese', 'Korean'], preview: 'Deep and commanding, great for documentaries and announcements.' },
    { id: 'v-5', name: 'Shimmer', style: 'Friendly', speed: 'Fast', languages: ['English', 'Portuguese', 'Italian'], preview: 'Bright and energetic, ideal for tutorials and how-to content.' },
    { id: 'v-6', name: 'Alloy', style: 'Neutral', speed: 'Medium', languages: ['English', 'Chinese', 'Hindi'], preview: 'Balanced and versatile, works across a wide range of use cases.' },
];

const STYLE_COLORS: Record<string, string> = { Professional: '#00d4ff', Conversational: '#34d399', Narrative: '#7c3aed', Authoritative: '#ef4444', Friendly: '#f59e0b', Neutral: '#64748b' };

export default function TextToSpeechPage({ onNavigate }: Props) {
    const [text, setText] = useState('Welcome to PumpMe, the next generation AI inference platform.');
    const [selected, setSelected] = useState('v-1');

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0' }}>🔊 Text to Speech</h1>

            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter text to synthesize..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }} />

            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Select Voice</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {VOICES.map(v => (
                    <div key={v.id} onClick={() => setSelected(v.id)} style={{ padding: '0.6rem 0.75rem', background: selected === v.id ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected === v.id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.name}</span>
                            <span style={{ fontSize: '0.55rem', color: STYLE_COLORS[v.style] }}>{v.style}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.15rem' }}>{v.preview}</div>
                        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {v.languages.map(l => <span key={l} style={{ fontSize: '0.5rem', padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>{l}</span>)}
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>🔊 Generate Speech</button>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.5rem' }}>~{Math.ceil(text.length / 5)} tokens · Est. cost: ${(text.length * 0.000015).toFixed(4)}</div>
        </div>
    );
}
