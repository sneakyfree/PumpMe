// Network Peering Page

interface Props { onNavigate: (page: string) => void; }

interface PeeringLocation { region: string; exchange: string; asn: string; latency: string; bandwidth: string; status: 'active' | 'pending'; }

const PEERING: PeeringLocation[] = [
    { region: '🇺🇸 US East', exchange: 'Equinix DC11 (Ashburn)', asn: 'AS39572', latency: '<1ms', bandwidth: '100Gbps', status: 'active' },
    { region: '🇺🇸 US West', exchange: 'Equinix SV5 (San Jose)', asn: 'AS39572', latency: '<1ms', bandwidth: '100Gbps', status: 'active' },
    { region: '🇪🇺 EU West', exchange: 'AMS-IX (Amsterdam)', asn: 'AS39572', latency: '<1ms', bandwidth: '40Gbps', status: 'active' },
    { region: '🇩🇪 EU Central', exchange: 'DE-CIX (Frankfurt)', asn: 'AS39572', latency: '<1ms', bandwidth: '40Gbps', status: 'active' },
    { region: '🇯🇵 Asia Pacific', exchange: 'JPNAP (Tokyo)', asn: 'AS39572', latency: '<2ms', bandwidth: '20Gbps', status: 'active' },
    { region: '🇸🇬 SE Asia', exchange: 'Equinix SG3 (Singapore)', asn: 'AS39572', latency: '<2ms', bandwidth: '20Gbps', status: 'pending' },
];

export default function NetworkPeeringPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('data-centers')}>← Data Centers</button>
            <h1 style={{ margin: '1rem 0' }}>🌐 Network Peering</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Direct peering reduces latency for high-volume enterprise customers. Available at major internet exchanges worldwide.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Peering Locations', value: PEERING.filter(p => p.status === 'active').length, color: '#00d4ff' },
                    { label: 'Total Bandwidth', value: '320Gbps', color: '#34d399' },
                    { label: 'Avg Latency', value: '<1ms', color: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Region', 'Exchange', 'ASN', 'Latency', 'Bandwidth', 'Status'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '0.45rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PEERING.map(p => (
                            <tr key={p.region} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.45rem', fontWeight: 600 }}>{p.region}</td>
                                <td style={{ padding: '0.45rem', color: 'rgba(255,255,255,0.4)' }}>{p.exchange}</td>
                                <td style={{ padding: '0.45rem' }}><code style={{ fontSize: '0.72rem', color: '#00d4ff' }}>{p.asn}</code></td>
                                <td style={{ padding: '0.45rem', color: '#34d399' }}>{p.latency}</td>
                                <td style={{ padding: '0.45rem' }}>{p.bandwidth}</td>
                                <td style={{ padding: '0.45rem' }}><span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 600, background: p.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'active' ? '#34d399' : '#f59e0b' }}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px', textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
                🔧 Request a private network interconnect (PNI) for dedicated bandwidth. <button className="link-btn" style={{ fontSize: '0.75rem' }} onClick={() => onNavigate('contact')}>Contact Sales</button>
            </div>
        </div>
    );
}
