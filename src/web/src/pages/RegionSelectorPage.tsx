import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const REGIONS = [
    { id: 'us-east-1', name: 'US East (Virginia)', provider: 'AWS', latency: '12ms', gpus: 'A100, H100', status: 'available' as const },
    { id: 'us-west-2', name: 'US West (Oregon)', provider: 'AWS', latency: '45ms', gpus: 'A100, L40S', status: 'available' as const },
    { id: 'eu-west-1', name: 'EU West (Ireland)', provider: 'AWS', latency: '89ms', gpus: 'A100', status: 'available' as const },
    { id: 'eu-central-1', name: 'EU Central (Frankfurt)', provider: 'GCP', latency: '95ms', gpus: 'A100, H100', status: 'available' as const },
    { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', provider: 'AWS', latency: '142ms', gpus: 'A100', status: 'available' as const },
    { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', provider: 'GCP', latency: '168ms', gpus: 'L40S', status: 'limited' as const },
    { id: 'sa-east-1', name: 'South America (São Paulo)', provider: 'AWS', latency: '195ms', gpus: 'A100', status: 'coming-soon' as const },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    available: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    limited: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    'coming-soon': { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export default function RegionSelectorPage({ onNavigate }: Props) {
    const [selected, setSelected] = useState('us-east-1');

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('data-centers')}>← Data Centers</button>
            <h1 style={{ margin: '1rem 0' }}>🌍 Region Selector</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Choose the region closest to your users for lowest latency. Your default region applies to all API requests.
            </p>

            {REGIONS.map(r => (
                <div key={r.id} onClick={() => r.status === 'available' && setSelected(r.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', marginBottom: '0.35rem', background: selected === r.id ? 'rgba(0,212,255,0.03)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected === r.id ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', cursor: r.status === 'available' ? 'pointer' : 'default', opacity: r.status === 'coming-soon' ? 0.4 : 1, transition: 'border-color 0.2s' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {selected === r.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff' }} />}
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.name}</span>
                            <code style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{r.id}</code>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>
                            <span>{r.provider}</span>
                            <span>GPUs: {r.gpus}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: parseInt(r.latency) < 50 ? '#34d399' : parseInt(r.latency) < 100 ? '#f59e0b' : '#ef4444' }}>{r.latency}</span>
                        <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STATUS_STYLES[r.status].bg, color: STATUS_STYLES[r.status].color }}>{r.status}</span>
                    </div>
                </div>
            ))}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Default Region</button>
        </div>
    );
}
