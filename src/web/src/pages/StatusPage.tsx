import { useState, useEffect } from 'react';

interface ServiceStatus { name: string; status: 'operational' | 'degraded' | 'outage'; latencyMs?: number; lastChecked: string; }
interface Incident { id: string; title: string; status: string; severity: string; createdAt: string; resolvedAt?: string; }
interface StatusData { status: string; services: ServiceStatus[]; uptime: { last24h: number; last7d: number; last30d: number }; incidents: Incident[]; }
interface Props { onNavigate: (page: string) => void; }

export default function StatusPage({ onNavigate }: Props) {
    const [data, setData] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStatus(); const interval = setInterval(loadStatus, 30000); return () => clearInterval(interval); }, []);

    const loadStatus = async () => {
        try {
            const res = await fetch('/api/status');
            if (res.ok) { const d = await res.json(); setData(d.data); }
        } catch { /* */ }
        setLoading(false);
    };

    const STATUS_COLORS: Record<string, string> = { operational: '#34d399', degraded: '#f59e0b', outage: '#ef4444' };
    const STATUS_LABELS: Record<string, string> = { operational: 'All Systems Operational', degraded: 'Partial Degradation', outage: 'Service Disruption' };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>📡 System Status</h1>

            {data && (
                <>
                    {/* Overall status banner */}
                    <div style={{
                        background: `${STATUS_COLORS[data.status]}10`, border: `1px solid ${STATUS_COLORS[data.status]}30`,
                        borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                            {data.status === 'operational' ? '✅' : data.status === 'degraded' ? '⚠️' : '🔴'}
                        </div>
                        <div style={{ fontWeight: 700, color: STATUS_COLORS[data.status] }}>
                            {STATUS_LABELS[data.status] || data.status}
                        </div>
                    </div>

                    {/* Uptime */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: '24h', value: data.uptime.last24h },
                            { label: '7 days', value: data.uptime.last7d },
                            { label: '30 days', value: data.uptime.last30d },
                        ].map(u => (
                            <div key={u.label} style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px', padding: '0.75rem', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: u.value >= 99.9 ? '#34d399' : '#f59e0b' }}>{u.value}%</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{u.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Services */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem 1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>Services</div>
                        {data.services.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[s.status], marginRight: '0.75rem' }} />
                                <div style={{ flex: 1, fontSize: '0.85rem' }}>{s.name}</div>
                                {s.latencyMs !== undefined && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{s.latencyMs}ms</span>}
                                <span style={{ fontSize: '0.7rem', marginLeft: '0.75rem', color: STATUS_COLORS[s.status] }}>{s.status}</span>
                            </div>
                        ))}
                    </div>

                    {/* Incidents */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>Recent Incidents</div>
                        {data.incidents.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No recent incidents</div>
                        ) : data.incidents.map(inc => (
                            <div key={inc.id} style={{ padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{inc.title}</div>
                                    <span style={{
                                        fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px',
                                        background: inc.status === 'resolved' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: inc.status === 'resolved' ? '#34d399' : '#f59e0b',
                                    }}>{inc.status}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                                    {new Date(inc.createdAt).toLocaleDateString()}
                                    {inc.resolvedAt && ` — Resolved ${new Date(inc.resolvedAt).toLocaleDateString()}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
