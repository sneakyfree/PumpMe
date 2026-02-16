import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function CachingPage({ onNavigate }: Props) {
    const [enabled, setEnabled] = useState(true);
    const [ttl, setTtl] = useState(3600);
    const [semanticMatch, setSemanticMatch] = useState(true);

    const stats = { hitRate: 42.3, saved: '$12.40', cached: 1847, avgLatency: '3ms vs 890ms' };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0' }}>⚡ Prompt Caching</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Cache identical or semantically similar prompts to reduce latency and cost.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Hit Rate', value: `${stats.hitRate}%`, color: '#34d399' },
                    { label: 'Cost Saved', value: stats.saved, color: '#00d4ff' },
                    { label: 'Cached Prompts', value: stats.cached.toLocaleString(), color: '#7c3aed' },
                    { label: 'Cache vs API', value: stats.avgLatency, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Config */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Caching</span>
                    <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: enabled ? '#34d399' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }} onClick={() => setEnabled(!enabled)}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: enabled ? '18px' : '2px', transition: 'left 0.2s' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>TTL (seconds): {ttl}</label>
                    <input type="range" min={60} max={86400} step={60} value={ttl} onChange={e => setTtl(Number(e.target.value))} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}><span>1 min</span><span>1 hour</span><span>24 hours</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Semantic Matching</span>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Match semantically similar prompts (not just exact)</div>
                    </div>
                    <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: semanticMatch ? '#34d399' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }} onClick={() => setSemanticMatch(!semanticMatch)}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: semanticMatch ? '18px' : '2px', transition: 'left 0.2s' }} />
                    </div>
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>Save Cache Settings</button>
        </div>
    );
}
