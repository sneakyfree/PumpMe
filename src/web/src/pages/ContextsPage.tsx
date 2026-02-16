import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Context { id: string; name: string; tokens: number; source: string; lastUpdated: string; active: boolean; }

const MOCK_CONTEXTS: Context[] = [
    { id: 'ctx-1', name: 'Company Knowledge Base', tokens: 124500, source: 'Upload (PDF)', lastUpdated: '2 days ago', active: true },
    { id: 'ctx-2', name: 'API Documentation', tokens: 89200, source: 'URL crawl', lastUpdated: '1 week ago', active: true },
    { id: 'ctx-3', name: 'Product FAQ', tokens: 12800, source: 'Manual entry', lastUpdated: '3 days ago', active: true },
    { id: 'ctx-4', name: 'Legal Templates', tokens: 67400, source: 'Upload (DOCX)', lastUpdated: '2 weeks ago', active: false },
    { id: 'ctx-5', name: 'Support Transcripts', tokens: 234100, source: 'API sync', lastUpdated: '1 hour ago', active: true },
];

export default function ContextsPage({ onNavigate }: Props) {
    const [contexts, setContexts] = useState(MOCK_CONTEXTS);

    const toggle = (id: string) => setContexts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    const totalTokens = contexts.filter(c => c.active).reduce((s, c) => s + c.tokens, 0);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>📎 Contexts</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ Add Context</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Contexts', value: contexts.filter(c => c.active).length, color: '#34d399' },
                    { label: 'Total Tokens', value: `${(totalTokens / 1000).toFixed(0)}K`, color: '#00d4ff' },
                    { label: 'Est. Cost/Req', value: `$${(totalTokens * 0.000002).toFixed(4)}`, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {contexts.map(ctx => (
                <div key={ctx.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', opacity: ctx.active ? 1 : 0.5 }}>
                    <div style={{ cursor: 'pointer' }} onClick={() => toggle(ctx.id)}>
                        <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: ctx.active ? '#34d399' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: ctx.active ? '16px' : '2px', transition: 'left 0.2s' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ctx.name}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>
                            <span>{(ctx.tokens / 1000).toFixed(1)}K tokens</span>
                            <span>{ctx.source}</span>
                            <span>Updated {ctx.lastUpdated}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
