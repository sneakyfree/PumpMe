// SLA Page

interface Props { onNavigate: (page: string) => void; }

const SLA_ITEMS = [
    { metric: 'Platform Uptime', free: '99.0%', pro: '99.9%', enterprise: '99.95%', desc: 'Monthly availability of the PumpMe API and dashboard' },
    { metric: 'API Response Time', free: '<500ms', pro: '<200ms', enterprise: '<100ms', desc: 'P95 latency for API gateway responses (excl. inference)' },
    { metric: 'Session Spin-up', free: '<60s', pro: '<30s', enterprise: '<15s', desc: 'Time from session creation to inference-ready state' },
    { metric: 'Support Response', free: '48h', pro: '4h', enterprise: '1h', desc: 'Initial response time for support tickets' },
    { metric: 'Data Retention', free: '30 days', pro: '90 days', enterprise: '1 year', desc: 'Session logs, usage data, and audit trail retention' },
    { metric: 'Incident Updates', free: 'Status page', pro: 'Email + Status', enterprise: 'Dedicated + PagerDuty', desc: 'How you\'re notified during incidents' },
];

const CREDITS = [
    { downtime: '<99.95% (Enterprise)', credit: '10% of monthly spend' },
    { downtime: '<99.9% (Pro)', credit: '10% of monthly spend' },
    { downtime: '<99.5%', credit: '25% of monthly spend' },
    { downtime: '<99.0%', credit: '50% of monthly spend' },
    { downtime: '<95.0%', credit: '100% of monthly spend' },
];

export default function SlaPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Service Level Agreement</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Our commitment to reliability, performance, and support quality.
            </p>

            {/* SLA table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Metric', 'Free', 'Pro ($49/mo)', 'Enterprise'].map(h => (
                                <th key={h} style={{ textAlign: h === 'Metric' ? 'left' : 'center', padding: '0.5rem', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SLA_ITEMS.map(item => (
                            <tr key={item.metric} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{item.metric}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{item.desc}</div>
                                </td>
                                <td style={{ textAlign: 'center', padding: '0.5rem' }}>{item.free}</td>
                                <td style={{ textAlign: 'center', padding: '0.5rem', color: '#00d4ff' }}>{item.pro}</td>
                                <td style={{ textAlign: 'center', padding: '0.5rem', color: '#34d399', fontWeight: 600 }}>{item.enterprise}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Credit schedule */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>💰 SLA Credit Schedule</div>
                {CREDITS.map(c => (
                    <div key={c.downtime} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                        <span>{c.downtime}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{c.credit}</span>
                    </div>
                ))}
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>Credits applied automatically to next billing cycle. Must be claimed within 30 days.</div>
            </div>

            {/* Exclusions */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>⚠️ Exclusions</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
                    <li>Scheduled maintenance (announced 48h in advance)</li>
                    <li>Force majeure events</li>
                    <li>Customer-caused outages (API key misuse, rate limit abuse)</li>
                    <li>Third-party GPU provider outages beyond our failover coverage</li>
                    <li>Free tier accounts (best-effort basis only)</li>
                </ul>
            </div>
        </div>
    );
}
