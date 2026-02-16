// Data Centers Page

interface Props { onNavigate: (page: string) => void; }

interface DataCenter { region: string; location: string; provider: string; gpus: string[]; latency: string; status: 'operational' | 'limited'; }

const CENTERS: DataCenter[] = [
    { region: 'US East', location: 'Virginia', provider: 'Lambda Labs', gpus: ['H100 80GB', 'A100 80GB'], latency: '~15ms', status: 'operational' },
    { region: 'US West', location: 'Oregon', provider: 'Vast.ai', gpus: ['A100 80GB', 'RTX 4090', 'RTX 3090'], latency: '~25ms', status: 'operational' },
    { region: 'US Central', location: 'Texas', provider: 'RunPod', gpus: ['A100 40GB', 'L40S', 'A6000'], latency: '~20ms', status: 'operational' },
    { region: 'EU West', location: 'Netherlands', provider: 'Vast.ai', gpus: ['A100 80GB', 'RTX 4090'], latency: '~85ms', status: 'operational' },
    { region: 'EU Central', location: 'Germany', provider: 'Lambda Labs', gpus: ['H100 80GB'], latency: '~80ms', status: 'limited' },
    { region: 'Asia Pacific', location: 'Singapore', provider: 'RunPod', gpus: ['A100 40GB', 'RTX 4090'], latency: '~150ms', status: 'operational' },
];

export default function DataCentersPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('status')}>← Status</button>
            <h1 style={{ margin: '1rem 0' }}>🌍 Data Centers</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                GPU infrastructure across 6 regions. Sessions automatically route to the nearest available center.
            </p>

            {/* Map-style grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {CENTERS.map(dc => (
                    <div key={dc.region} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${dc.status === 'operational' ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)'}`, borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dc.region}</span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dc.status === 'operational' ? '#34d399' : '#f59e0b' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>📍 {dc.location} · {dc.provider}</div>
                        <div style={{ fontSize: '0.65rem', color: '#00d4ff', marginBottom: '0.2rem' }}>⏱ {dc.latency} from US East</div>
                        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {dc.gpus.map(g => (
                                <span key={g} style={{ padding: '0.1rem 0.25rem', borderRadius: '3px', fontSize: '0.55rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>{g}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                    { label: 'Regions', value: '6', color: '#00d4ff' },
                    { label: 'GPU Types', value: '6', color: '#7c3aed' },
                    { label: 'Providers', value: '3', color: '#34d399' },
                    { label: 'Uptime (30d)', value: '99.97%', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
