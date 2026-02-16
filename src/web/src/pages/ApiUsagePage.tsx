import { useState, useEffect } from 'react';

interface DailyUsage { date: string; requests: number; tokens: number; errors: number; latencyP50: number; latencyP95: number; }
interface TopModel { model: string; requests: number; tokens: number; }
interface Props { onNavigate: (page: string) => void; }

export default function ApiUsagePage({ onNavigate }: Props) {
    const [daily, setDaily] = useState<DailyUsage[]>([]);
    const [models, setModels] = useState<TopModel[]>([]);
    const [totals, setTotals] = useState({ requests: 0, tokens: 0, errors: 0 });
    const [errorRate, setErrorRate] = useState(0);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsage(); }, [days]);

    const loadUsage = async () => {
        try {
            const res = await fetch(`/api/api-usage?days=${days}`, { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setDaily(d.data?.dailyUsage || []); setModels(d.data?.topModels || []); setTotals(d.data?.totals || {}); setErrorRate(d.data?.errorRate || 0); }
        } catch { /* */ }
        setLoading(false);
    };

    const maxReqs = Math.max(...daily.map(d => d.requests), 1);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('api-keys')}>← API Keys</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>📊 API Usage</h1>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[7, 14, 30].map(d => (
                        <button key={d} onClick={() => setDays(d)} style={{
                            padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                            background: days === d ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: days === d ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                        }}>{d}d</button>
                    ))}
                </div>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Requests', value: totals.requests.toLocaleString(), color: '#00d4ff' },
                    { label: 'Total Tokens', value: totals.tokens.toLocaleString(), color: '#34d399' },
                    { label: 'Errors', value: totals.errors.toLocaleString(), color: '#ef4444' },
                    { label: 'Error Rate', value: `${errorRate}%`, color: errorRate > 5 ? '#ef4444' : '#34d399' },
                ].map(c => (
                    <div key={c.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Request chart (bar chart) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Daily Requests</div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '2px', height: '120px' }}>
                    {daily.slice(-30).map((d, i) => (
                        <div key={i} title={`${d.date}: ${d.requests} reqs`} style={{
                            flex: 1, borderRadius: '2px 2px 0 0', minWidth: '4px',
                            height: `${(d.requests / maxReqs) * 100}%`,
                            background: d.errors > 5 ? 'rgba(239,68,68,0.6)' : 'rgba(0,212,255,0.4)',
                        }} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>
                    <span>{daily[0]?.date || ''}</span><span>{daily[daily.length - 1]?.date || ''}</span>
                </div>
            </div>

            {/* Top models */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Top Models</div>
                {models.map((m, i) => {
                    const pct = totals.requests > 0 ? (m.requests / totals.requests) * 100 : 0;
                    return (
                        <div key={i} style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.model.split('/').pop()}</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{m.requests.toLocaleString()} reqs · {(m.tokens / 1000).toFixed(0)}K tokens</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#00d4ff', borderRadius: '2px' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
