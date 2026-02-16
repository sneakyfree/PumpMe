import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface AuditEntry { id: string; action: string; actor: string; target: string; ip: string; timestamp: string; severity: 'info' | 'warning' | 'critical'; }

const MOCK_AUDIT: AuditEntry[] = [
    { id: 'au-1', action: 'api_key.created', actor: 'john@example.com', target: 'Production Key', ip: '172.16.0.1', timestamp: '10 min ago', severity: 'info' },
    { id: 'au-2', action: 'team.member_added', actor: 'john@example.com', target: 'sarah@example.com', ip: '172.16.0.1', timestamp: '1 hour ago', severity: 'info' },
    { id: 'au-3', action: 'api_key.revoked', actor: 'admin@example.com', target: 'Old Staging Key', ip: '10.0.0.5', timestamp: '3 hours ago', severity: 'warning' },
    { id: 'au-4', action: 'billing.plan_changed', actor: 'john@example.com', target: 'Pro → Enterprise', ip: '172.16.0.1', timestamp: '1 day ago', severity: 'info' },
    { id: 'au-5', action: 'auth.password_changed', actor: 'john@example.com', target: 'Self', ip: '203.0.113.5', timestamp: '2 days ago', severity: 'warning' },
    { id: 'au-6', action: 'auth.login_failed', actor: 'unknown@attacker.com', target: 'john@example.com', ip: '198.51.100.99', timestamp: '3 days ago', severity: 'critical' },
    { id: 'au-7', action: 'webhook.endpoint_added', actor: 'sarah@example.com', target: 'https://api.myapp.com/hooks', ip: '172.16.0.2', timestamp: '4 days ago', severity: 'info' },
    { id: 'au-8', action: 'guardrail.rule_disabled', actor: 'admin@example.com', target: 'PII Detection', ip: '10.0.0.5', timestamp: '5 days ago', severity: 'warning' },
];

const SEV_STYLES: Record<string, { color: string; bg: string }> = {
    info: { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function AuditTrailPage({ onNavigate }: Props) {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? MOCK_AUDIT : MOCK_AUDIT.filter(a => a.severity === filter);

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('audit-log')}>← Audit Log</button>
            <h1 style={{ margin: '1rem 0' }}>🔍 Audit Trail</h1>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {['all', 'info', 'warning', 'critical'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{f}</button>
                ))}
            </div>

            {filtered.map(entry => (
                <div key={entry.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', alignItems: 'start' }}>
                    <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, flexShrink: 0, marginTop: '0.15rem', background: SEV_STYLES[entry.severity].bg, color: SEV_STYLES[entry.severity].color }}>{entry.severity}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <code style={{ fontSize: '0.78rem', fontWeight: 600, color: '#00d4ff' }}>{entry.action}</code>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{entry.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                            {entry.actor} → {entry.target} · <code style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{entry.ip}</code>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
