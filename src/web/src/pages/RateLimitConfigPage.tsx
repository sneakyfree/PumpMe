// Rate Limit Config Page

interface Props { onNavigate: (page: string) => void; }

interface RateLimit { endpoint: string; free: string; pro: string; enterprise: string; unit: string; }

const LIMITS: RateLimit[] = [
    { endpoint: 'Chat Completions', free: '60', pro: '600', enterprise: '6,000', unit: 'req/min' },
    { endpoint: 'Streaming', free: '20', pro: '200', enterprise: '2,000', unit: 'concurrent' },
    { endpoint: 'Batch Jobs', free: '1', pro: '10', enterprise: '100', unit: 'concurrent' },
    { endpoint: 'Fine-Tuning', free: '—', pro: '3', enterprise: '20', unit: 'concurrent' },
    { endpoint: 'Embeddings', free: '100', pro: '1,000', enterprise: '10,000', unit: 'req/min' },
    { endpoint: 'Image Generation', free: '10', pro: '100', enterprise: '1,000', unit: 'req/min' },
    { endpoint: 'File Upload', free: '10 MB', pro: '500 MB', enterprise: '5 GB', unit: 'max size' },
    { endpoint: 'Webhooks', free: '5', pro: '50', enterprise: '500', unit: 'endpoints' },
];

const HEADERS = [
    { header: 'X-RateLimit-Limit', desc: 'Maximum requests allowed in the current window' },
    { header: 'X-RateLimit-Remaining', desc: 'Requests remaining in the current window' },
    { header: 'X-RateLimit-Reset', desc: 'Unix timestamp when the window resets' },
    { header: 'Retry-After', desc: 'Seconds to wait before retrying (only on 429)' },
];

export default function RateLimitConfigPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('usage-limits')}>← Usage Limits</button>
            <h1 style={{ margin: '1rem 0' }}>⏱️ Rate Limits</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Limits by tier and endpoint. All limits reset every 60 seconds unless noted.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Endpoint', 'Free', 'Pro', 'Enterprise', 'Unit'].map(h => (
                                <th key={h} style={{ textAlign: h === 'Endpoint' || h === 'Unit' ? 'left' : 'center', padding: '0.45rem', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {LIMITS.map(l => (
                            <tr key={l.endpoint} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.45rem', fontWeight: 600 }}>{l.endpoint}</td>
                                <td style={{ textAlign: 'center', padding: '0.45rem' }}>{l.free}</td>
                                <td style={{ textAlign: 'center', padding: '0.45rem', color: '#00d4ff' }}>{l.pro}</td>
                                <td style={{ textAlign: 'center', padding: '0.45rem', color: '#34d399', fontWeight: 600 }}>{l.enterprise}</td>
                                <td style={{ padding: '0.45rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{l.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Response headers */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>📡 Rate Limit Headers</div>
                {HEADERS.map(h => (
                    <div key={h.header} style={{ display: 'flex', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                        <code style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(0,0,0,0.3)', color: '#00d4ff', fontSize: '0.72rem', flexShrink: 0 }}>{h.header}</code>
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{h.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
