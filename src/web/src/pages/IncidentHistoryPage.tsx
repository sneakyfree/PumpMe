// Incident History Page

interface Props { onNavigate: (page: string) => void; }



const INCIDENTS = [
    { id: 'inc-024', title: 'Elevated API latency in US-East region', severity: 'minor' as const, status: 'resolved' as const, affected: ['API Gateway', 'Inference'], started: 'Feb 7, 2026 14:23 UTC', resolved: 'Feb 7, 2026 15:01 UTC', duration: '38 min', rca: 'Network congestion at upstream provider. Traffic rerouted to secondary path.' },
    { id: 'inc-023', title: 'Webhook delivery delays', severity: 'major' as const, status: 'monitoring' as const, affected: ['Webhooks'], started: 'Feb 5, 2026 09:12 UTC', duration: '2h (ongoing)', rca: 'Queue backlog from burst traffic. Scaling webhook workers.' },
    { id: 'inc-022', title: 'Batch inference queue stall', severity: 'major' as const, status: 'resolved' as const, affected: ['Batch Jobs', 'Inference'], started: 'Jan 28, 2026 22:45 UTC', resolved: 'Jan 29, 2026 01:30 UTC', duration: '2h 45m', rca: 'GPU scheduling deadlock in batch orchestrator. Hotfix deployed.' },
    { id: 'inc-021', title: 'Authentication service degradation', severity: 'critical' as const, status: 'resolved' as const, affected: ['Auth', 'API Gateway', 'Dashboard'], started: 'Jan 15, 2026 08:00 UTC', resolved: 'Jan 15, 2026 08:42 UTC', duration: '42 min', rca: 'Database connection pool exhaustion during peak traffic. Pool limits increased.' },
    { id: 'inc-020', title: 'Scheduled maintenance: Database migration', severity: 'minor' as const, status: 'resolved' as const, affected: ['Database'], started: 'Jan 10, 2026 03:00 UTC', resolved: 'Jan 10, 2026 04:15 UTC', duration: '1h 15m', rca: 'Planned maintenance window. Schema migration completed successfully.' },
];

const SEV_STYLES: Record<string, { color: string; bg: string }> = {
    minor: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    major: { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const STAT_STYLES: Record<string, { color: string; bg: string }> = {
    resolved: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    monitoring: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    investigating: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function IncidentHistoryPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('status')}>← Status</button>
            <h1 style={{ margin: '1rem 0' }}>🚨 Incident History</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Incidents (90d)', value: INCIDENTS.length, color: '#00d4ff' },
                    { label: 'Avg Resolution', value: '1h 24m', color: '#34d399' },
                    { label: 'Uptime (90d)', value: '99.95%', color: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {INCIDENTS.map(inc => (
                <div key={inc.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: SEV_STYLES[inc.severity].bg, color: SEV_STYLES[inc.severity].color }}>{inc.severity}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inc.title}</span>
                        </div>
                        <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STAT_STYLES[inc.status].bg, color: STAT_STYLES[inc.status].color }}>{inc.status}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>{inc.rca}</div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                        <span>⏱ {inc.duration}</span>
                        <span>Started: {inc.started}</span>
                        <span>{inc.affected.join(', ')}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
