// System Health Page

interface Props { onNavigate: (page: string) => void; }

interface Metric { name: string; value: string; unit: string; status: 'good' | 'warning' | 'critical'; trend: string; }

const METRICS: Metric[] = [
    { name: 'API Latency (p50)', value: '42', unit: 'ms', status: 'good', trend: '↓ 3ms' },
    { name: 'API Latency (p99)', value: '187', unit: 'ms', status: 'good', trend: '↓ 12ms' },
    { name: 'Inference Queue', value: '23', unit: 'requests', status: 'good', trend: '↓ 5' },
    { name: 'GPU Utilization', value: '78', unit: '%', status: 'good', trend: '↑ 2%' },
    { name: 'Error Rate', value: '0.12', unit: '%', status: 'good', trend: '↓ 0.03%' },
    { name: 'Active Sessions', value: '1,247', unit: 'sessions', status: 'good', trend: '↑ 89' },
    { name: 'Webhook Delivery', value: '99.2', unit: '%', status: 'warning', trend: '↓ 0.3%' },
    { name: 'Cache Hit Rate', value: '94.5', unit: '%', status: 'good', trend: '↑ 1.2%' },
];

const STATUS_COLORS = { good: '#34d399', warning: '#f59e0b', critical: '#ef4444' };

const INCIDENTS = [
    { time: '2 hours ago', title: 'Webhook delivery delays', status: 'Investigating', severity: 'minor' },
    { time: '3 days ago', title: 'Elevated latency on A100 cluster', status: 'Resolved', severity: 'minor' },
    { time: '1 week ago', title: 'Scheduled maintenance: Database migration', status: 'Completed', severity: 'maintenance' },
];

export default function SystemHealthPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('uptime')}>← Uptime</button>
            <h1 style={{ margin: '1rem 0' }}>💚 System Health</h1>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {METRICS.map(m => (
                    <div key={m.name} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: STATUS_COLORS[m.status] }}>{m.value}</span>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[m.status] }} />
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.55rem', color: m.trend.startsWith('↓') ? '#34d399' : '#f59e0b', marginTop: '0.1rem' }}>{m.trend}</div>
                    </div>
                ))}
            </div>

            {/* Recent incidents */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>🔔 Recent Incidents</div>
                {INCIDENTS.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < INCIDENTS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{inc.title}</span>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginLeft: '0.5rem' }}>{inc.time}</span>
                        </div>
                        <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.25rem', borderRadius: '3px', fontWeight: 600, background: inc.status === 'Resolved' || inc.status === 'Completed' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: inc.status === 'Resolved' || inc.status === 'Completed' ? '#34d399' : '#f59e0b' }}>{inc.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
