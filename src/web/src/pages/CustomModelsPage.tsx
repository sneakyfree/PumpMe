import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface CustomModel { id: string; name: string; baseModel: string; status: 'ready' | 'training' | 'failed'; created: string; size: string; requests7d: number; }

const MOCK_MODELS: CustomModel[] = [
    { id: 'ft-001', name: 'support-classifier-v2', baseModel: 'Llama 3.1 8B', status: 'ready', created: '3 days ago', size: '128MB adapter', requests7d: 1240 },
    { id: 'ft-002', name: 'code-review-bot', baseModel: 'CodeLlama 34B', status: 'ready', created: '1 week ago', size: '256MB adapter', requests7d: 3420 },
    { id: 'ft-003', name: 'legal-summarizer', baseModel: 'Llama 3.1 70B', status: 'training', created: '2 hours ago', size: 'In progress', requests7d: 0 },
    { id: 'ft-004', name: 'medical-qa-v1', baseModel: 'Mistral 7B', status: 'failed', created: '5 days ago', size: '—', requests7d: 0 },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    ready: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'Ready' },
    training: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Training' },
    failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Failed' },
};

export default function CustomModelsPage({ onNavigate }: Props) {
    const [models] = useState(MOCK_MODELS);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('fine-tuning')}>← Fine-Tuning</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>🧠 Custom Models</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => onNavigate('fine-tuning')}>+ New Model</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Models', value: models.length, color: '#00d4ff' },
                    { label: 'Ready', value: models.filter(m => m.status === 'ready').length, color: '#34d399' },
                    { label: 'Requests (7d)', value: models.reduce((s, m) => s + m.requests7d, 0).toLocaleString(), color: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {models.map(m => (
                <div key={m.id} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                                Base: {m.baseModel} · {m.size} · Created {m.created}
                            </div>
                        </div>
                        <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, background: STATUS_STYLES[m.status].bg, color: STATUS_STYLES[m.status].color }}>{STATUS_STYLES[m.status].label}</span>
                    </div>
                    {m.status === 'ready' && (
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={() => onNavigate('playground')} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>▶ Try in Playground</button>
                            <code style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{m.requests7d.toLocaleString()} requests/7d</code>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
