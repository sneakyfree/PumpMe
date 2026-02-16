// Uptime Monitor Page

interface Props { onNavigate: (page: string) => void; }

interface Service { name: string; status: 'operational' | 'degraded' | 'outage'; uptime30d: number; bars: number[]; }

const SERVICES: Service[] = [
    { name: 'API Gateway', status: 'operational', uptime30d: 99.98, bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Inference Engine', status: 'operational', uptime30d: 99.95, bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Dashboard', status: 'operational', uptime30d: 99.99, bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Session Manager', status: 'operational', uptime30d: 99.92, bars: [1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Billing Service', status: 'operational', uptime30d: 99.99, bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Webhooks', status: 'degraded', uptime30d: 99.85, bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5] },
];

const STATUS_MAP: Record<string, { color: string; label: string }> = {
    operational: { color: '#34d399', label: 'Operational' },
    degraded: { color: '#f59e0b', label: 'Degraded' },
    outage: { color: '#ef4444', label: 'Major Outage' },
};

export default function UptimeMonitorPage({ onNavigate }: Props) {
    const allOperational = SERVICES.every(s => s.status === 'operational');

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('status')}>← Status</button>
            <h1 style={{ margin: '1rem 0' }}>📊 Uptime Monitor</h1>

            {/* Overall status */}
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', textAlign: 'center', background: allOperational ? 'rgba(52,211,153,0.05)' : 'rgba(245,158,11,0.05)', border: `1px solid ${allOperational ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: allOperational ? '#34d399' : '#f59e0b' }}>
                    {allOperational ? '✅ All Systems Operational' : '⚠️ Partial Service Degradation'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>Last updated: just now</div>
            </div>

            {/* Services */}
            {SERVICES.map(svc => (
                <div key={svc.name} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{svc.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{svc.uptime30d}%</span>
                            <span style={{ padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, background: `${STATUS_MAP[svc.status].color}15`, color: STATUS_MAP[svc.status].color }}>{STATUS_MAP[svc.status].label}</span>
                        </div>
                    </div>
                    {/* 30-day bar chart */}
                    <div style={{ display: 'flex', gap: '2px', height: '20px' }}>
                        {svc.bars.map((v, i) => (
                            <div key={i} style={{ flex: 1, borderRadius: '2px', background: v === 1 ? '#34d399' : v === 0.5 ? '#f59e0b' : '#ef4444', opacity: 0.7 }} title={`Day ${i + 1}: ${v === 1 ? 'OK' : 'Issue'}`} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.15rem' }}>
                        <span>30 days ago</span><span>Today</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
