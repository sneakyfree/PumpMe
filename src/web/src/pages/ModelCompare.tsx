/**
 * Model Comparison Tool — side-by-side model comparison
 *
 * FEAT-063: Compare models across specs, benchmarks, compatibility
 */

import { useState, useEffect } from 'react';

interface Model {
    id: string;
    name: string;
    provider: string;
    category: string;
    parameterCount: string;
    minVram: number;
    description: string;
    tags: string[];
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function ModelCompare({ onNavigate }: Props) {
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [selected, setSelected] = useState<string[]>(['', '']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/models')
            .then(res => res.json())
            .then(data => { setAllModels(data.data?.models || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const setModel = (index: number, modelId: string) => {
        setSelected(prev => prev.map((s, i) => i === index ? modelId : s));
    };

    const getModel = (id: string) => allModels.find(m => m.id === id);

    const CATEGORY_COLORS: Record<string, string> = {
        language: '#00d4ff', code: '#34d399', image: '#a855f7', video: '#f59e0b', audio: '#ec4899', multimodal: '#ef4444',
    };

    const TIER_COMPAT = [
        { name: 'Starter', vram: 16, color: '#34d399' },
        { name: 'Pro', vram: 24, color: '#00d4ff' },
        { name: 'Beast', vram: 48, color: '#a855f7' },
        { name: 'Ultra', vram: 80, color: '#f59e0b' },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>⚖️</span> Compare Models
            </h1>

            {/* Model Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {selected.map((sel, idx) => (
                    <select
                        key={idx}
                        value={sel}
                        onChange={e => setModel(idx, e.target.value)}
                        style={{
                            padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', cursor: 'pointer',
                        }}
                    >
                        <option value="">Select Model {idx + 1}</option>
                        {allModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.parameterCount})</option>
                        ))}
                    </select>
                ))}
            </div>

            {/* Comparison table */}
            {selected.some(Boolean) && (
                <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px', overflow: 'hidden',
                }}>
                    {[
                        { label: 'Provider', fn: (m: Model) => m.provider },
                        {
                            label: 'Category', fn: (m: Model) => (
                                <span style={{
                                    padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                    background: `${CATEGORY_COLORS[m.category] || '#94a3b8'}15`,
                                    color: CATEGORY_COLORS[m.category] || '#94a3b8',
                                }}>{m.category}</span>
                            )
                        },
                        { label: 'Parameters', fn: (m: Model) => m.parameterCount },
                        { label: 'Min VRAM', fn: (m: Model) => `${m.minVram} GB` },
                        {
                            label: 'Compatible Tiers', fn: (m: Model) => (
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {TIER_COMPAT.filter(t => t.vram >= m.minVram).map(t => (
                                        <span key={t.name} style={{
                                            padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem',
                                            background: `${t.color}15`, color: t.color,
                                        }}>{t.name}</span>
                                    ))}
                                </div>
                            )
                        },
                        { label: 'Tags', fn: (m: Model) => m.tags?.join(', ') || '—' },
                        { label: 'Description', fn: (m: Model) => m.description },
                    ].map((row, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '140px 1fr 1fr',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{
                                padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.02)',
                            }}>{row.label}</div>
                            {selected.map((sel, idx) => {
                                const m = getModel(sel);
                                return (
                                    <div key={idx} style={{
                                        padding: '0.75rem 1rem', fontSize: '0.85rem',
                                        borderLeft: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        {m ? row.fn(m) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {!selected.some(Boolean) && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚖️</div>
                    <p>Select two models above to compare them side by side.</p>
                </div>
            )}
        </div>
    );
}
