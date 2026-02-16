/**
 * Usage Analytics Page — visual analytics dashboard
 *
 * FEAT-062: Usage analytics with charts and breakdowns
 */

import { useState, useEffect } from 'react';

interface DailyUsage {
    date: string;
    sessions: number;
    minutes: number;
    cost: number;
}

interface AnalyticsData {
    daily: DailyUsage[];
    gpuBreakdown: Record<string, number>;
    tierBreakdown: Record<string, number>;
    totals: { sessions: number; minutes: number; cost: number; completed: number; failed: number };
    days: number;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function AnalyticsPage({ onNavigate }: Props) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [days]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/usage?days=${days}`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const GPU_COLORS: Record<string, string> = {
        H100: '#f59e0b', A100: '#a855f7', 'RTX 5090': '#00d4ff', 'RTX 4090': '#34d399', 'RTX 3090': '#ec4899',
    };

    const maxMinutes = data ? Math.max(...data.daily.map(d => d.minutes), 1) : 1;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>📊</span> Usage Analytics
            </h1>

            {/* Period Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[7, 14, 30, 60, 90].map(d => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        style={{
                            padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                            background: days === d ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${days === d ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            color: days === d ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {d}d
                    </button>
                ))}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {!loading && data && (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Sessions', value: data.totals.sessions, icon: '🚀' },
                            { label: 'GPU Hours', value: `${(data.totals.minutes / 60).toFixed(1)}h`, icon: '⏱️' },
                            { label: 'Spent', value: `$${(data.totals.cost / 100).toFixed(2)}`, icon: '💰' },
                            { label: 'Success Rate', value: data.totals.sessions > 0 ? `${Math.round((data.totals.completed / data.totals.sessions) * 100)}%` : '—', icon: '✅' },
                        ].map(card => (
                            <div key={card.label} style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '12px', padding: '1rem', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{card.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Usage Chart (simple bar chart) */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Daily GPU Minutes</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px' }}>
                            {data.daily.slice(-days).map((d, i) => (
                                <div
                                    key={i}
                                    title={`${d.date}: ${d.minutes}min, ${d.sessions} sessions`}
                                    style={{
                                        flex: 1, minWidth: '3px', borderRadius: '2px 2px 0 0',
                                        height: `${Math.max((d.minutes / maxMinutes) * 100, d.minutes > 0 ? 3 : 0)}%`,
                                        background: d.minutes > 0
                                            ? 'linear-gradient(to top, rgba(0,212,255,0.3), rgba(0,212,255,0.7))'
                                            : 'rgba(255,255,255,0.03)',
                                        transition: 'height 0.3s',
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{data.daily[0]?.date}</span>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{data.daily[data.daily.length - 1]?.date}</span>
                        </div>
                    </div>

                    {/* Breakdowns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* GPU Breakdown */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px', padding: '1rem',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>GPU Types</div>
                            {Object.entries(data.gpuBreakdown).length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No data</div>
                            ) : Object.entries(data.gpuBreakdown).sort(([, a], [, b]) => b - a).map(([gpu, count]) => {
                                const total = Object.values(data.gpuBreakdown).reduce((s, v) => s + v, 0);
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={gpu} style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.15rem' }}>
                                            <span>{gpu}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: GPU_COLORS[gpu] || '#94a3b8', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tier Breakdown */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px', padding: '1rem',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Session Tiers</div>
                            {Object.entries(data.tierBreakdown).length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No data</div>
                            ) : Object.entries(data.tierBreakdown).sort(([, a], [, b]) => b - a).map(([tier, count]) => {
                                const TIER_COLORS: Record<string, string> = { free: '#94a3b8', starter: '#34d399', pro: '#00d4ff', beast: '#a855f7', ultra: '#f59e0b' };
                                const total = Object.values(data.tierBreakdown).reduce((s, v) => s + v, 0);
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={tier} style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.15rem' }}>
                                            <span style={{ color: TIER_COLORS[tier] || '#94a3b8' }}>{tier}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: TIER_COLORS[tier] || '#94a3b8', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
