import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Invite { code: string; createdAt: string; usedBy: string | null; usedAt: string | null; status: 'active' | 'used' | 'expired'; }

const MOCK_INVITES: Invite[] = [
    { code: 'PM-A1B2C3D4', createdAt: '2026-02-01', usedBy: 'alice@dev.com', usedAt: '2026-02-03', status: 'used' },
    { code: 'PM-E5F6G7H8', createdAt: '2026-02-05', usedBy: 'bob@ml.io', usedAt: '2026-02-07', status: 'used' },
    { code: 'PM-I9J0K1L2', createdAt: '2026-02-08', usedBy: null, usedAt: null, status: 'active' },
    { code: 'PM-M3N4O5P6', createdAt: '2026-01-15', usedBy: null, usedAt: null, status: 'expired' },
    { code: 'PM-Q7R8S9T0', createdAt: '2026-02-09', usedBy: null, usedAt: null, status: 'active' },
];

export default function InviteTrackerPage({ onNavigate }: Props) {
    const [invites] = useState<Invite[]>(MOCK_INVITES);
    const [copied, setCopied] = useState<string | null>(null);

    const stats = {
        total: invites.length,
        used: invites.filter(i => i.status === 'used').length,
        active: invites.filter(i => i.status === 'active').length,
        expired: invites.filter(i => i.status === 'expired').length,
    };

    const copy = (code: string) => {
        navigator.clipboard.writeText(`https://pumpme.io/invite/${code}`);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const statusColors: Record<string, string> = { active: '#34d399', used: '#64748b', expired: '#ef4444' };

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('referrals')}>← Referrals</button>
            <h1 style={{ margin: '1rem 0' }}>🎟️ Invite Tracker</h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Sent', value: stats.total, color: '#00d4ff' },
                    { label: 'Accepted', value: stats.used, color: '#34d399' },
                    { label: 'Pending', value: stats.active, color: '#f59e0b' },
                    { label: 'Expired', value: stats.expired, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Conversion rate */}
            <div style={{ background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>Conversion Rate: </span>
                <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>{stats.total > 0 ? ((stats.used / stats.total) * 100).toFixed(0) : 0}%</strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}> · ${(stats.used * 5).toFixed(0)} earned in referral credits</span>
            </div>

            {/* Invite list */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                {invites.map((inv, i) => (
                    <div key={inv.code} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inv.code}</code>
                                <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', background: `${statusColors[inv.status]}15`, color: statusColors[inv.status] }}>{inv.status}</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>
                                Created {inv.createdAt}
                                {inv.usedBy && <> · Used by <strong>{inv.usedBy}</strong> on {inv.usedAt}</>}
                            </div>
                        </div>
                        {inv.status === 'active' && (
                            <button onClick={() => copy(inv.code)} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                                {copied === inv.code ? '✓ Copied' : '📋 Copy'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
