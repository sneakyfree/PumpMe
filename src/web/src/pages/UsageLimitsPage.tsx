import { useState, useEffect } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface UsageData {
    daily: { minutesUsed: number; minutesLimit: number; sessionsUsed: number; sessionsLimit: number; };
    monthly: { minutesUsed: number; minutesLimit: number; storageGb: number; storageLimit: number; apiCalls: number; apiLimit: number; };
    tier: string;
}

export default function UsageLimitsPage({ onNavigate }: Props) {
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data load
        setTimeout(() => {
            setUsage({
                daily: { minutesUsed: 42, minutesLimit: 60, sessionsUsed: 3, sessionsLimit: 5 },
                monthly: { minutesUsed: 680, minutesLimit: 1800, storageGb: 12.4, storageLimit: 50, apiCalls: 4520, apiLimit: 10000 },
                tier: 'free',
            });
            setLoading(false);
        }, 300);
    }, []);

    const ProgressBar = ({ used, limit, label, unit }: { used: number; limit: number; label: string; unit: string }) => {
        const pct = Math.min((used / limit) * 100, 100);
        const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#34d399';
        return (
            <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span>{label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{used.toLocaleString()} / {limit.toLocaleString()} {unit}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '0.65rem', color, textAlign: 'right', marginTop: '0.1rem' }}>{pct.toFixed(0)}% used</div>
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;
    if (!usage) return null;

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>📏 Usage & Limits</h1>

            {/* Tier badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>{usage.tier}</span>
                <button className="link-btn" onClick={() => onNavigate('subscription')} style={{ fontSize: '0.75rem' }}>Upgrade for higher limits →</button>
            </div>

            {/* Daily Limits */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#00d4ff' }}>📅 Daily Limits</div>
                <ProgressBar used={usage.daily.minutesUsed} limit={usage.daily.minutesLimit} label="GPU Minutes" unit="min" />
                <ProgressBar used={usage.daily.sessionsUsed} limit={usage.daily.sessionsLimit} label="Concurrent Sessions" unit="" />
            </div>

            {/* Monthly Limits */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#00d4ff' }}>📆 Monthly Limits</div>
                <ProgressBar used={usage.monthly.minutesUsed} limit={usage.monthly.minutesLimit} label="GPU Minutes" unit="min" />
                <ProgressBar used={usage.monthly.storageGb} limit={usage.monthly.storageLimit} label="Storage" unit="GB" />
                <ProgressBar used={usage.monthly.apiCalls} limit={usage.monthly.apiLimit} label="API Calls" unit="calls" />
            </div>

            {/* Tier comparison */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📊 Tier Limits Comparison</div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th style={{ textAlign: 'left', padding: '0.4rem', color: 'rgba(255,255,255,0.3)' }}>Limit</th>
                                <th style={{ textAlign: 'center', padding: '0.4rem', color: usage.tier === 'free' ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>Free</th>
                                <th style={{ textAlign: 'center', padding: '0.4rem' }}>Pro</th>
                                <th style={{ textAlign: 'center', padding: '0.4rem' }}>Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Daily Minutes', '60', '480', 'Unlimited'],
                                ['Sessions', '1', '5', '20'],
                                ['Monthly Minutes', '1,800', '14,400', 'Unlimited'],
                                ['Storage', '5 GB', '50 GB', '500 GB'],
                                ['API Calls/mo', '10K', '100K', 'Unlimited'],
                                ['Team Members', '—', '5', '50'],
                            ].map(([label, free, pro, ent]) => (
                                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.35rem 0.4rem' }}>{label}</td>
                                    <td style={{ textAlign: 'center', padding: '0.35rem' }}>{free}</td>
                                    <td style={{ textAlign: 'center', padding: '0.35rem' }}>{pro}</td>
                                    <td style={{ textAlign: 'center', padding: '0.35rem' }}>{ent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
