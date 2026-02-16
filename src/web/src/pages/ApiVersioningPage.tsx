// API Versioning Page

interface Props { onNavigate: (page: string) => void; }

interface ApiVersion { version: string; status: 'current' | 'supported' | 'deprecated' | 'sunset'; released: string; sunsetDate?: string; changes: string[]; }

const VERSIONS: ApiVersion[] = [
    { version: 'v1.3', status: 'current', released: 'Jan 2026', changes: ['Batch inference endpoint', 'Fine-tune job management API', 'Streaming function calls', 'Model capability metadata'] },
    { version: 'v1.2', status: 'supported', released: 'Oct 2025', changes: ['Session snapshots', 'Webhook signing v2', 'Usage analytics endpoints', 'Multi-region routing'] },
    { version: 'v1.1', status: 'supported', released: 'Jul 2025', sunsetDate: 'Jul 2026', changes: ['Streaming completions', 'API key scopes', 'Rate limit headers', 'Model aliases'] },
    { version: 'v1.0', status: 'deprecated', released: 'Mar 2025', sunsetDate: 'Mar 2026', changes: ['Initial release', 'Chat completions', 'Session management', 'Basic authentication'] },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    current: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    supported: { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    deprecated: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    sunset: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function ApiVersioningPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>🔄 API Versioning</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                We maintain backward compatibility for at least 12 months after a new major version. Specify your version via the <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>X-API-Version</code> header.
            </p>

            {VERSIONS.map(v => (
                <div key={v.version} style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${STATUS_STYLES[v.status].color}20`, borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{v.version}</span>
                            <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', background: STATUS_STYLES[v.status].bg, color: STATUS_STYLES[v.status].color }}>{v.status}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                            Released {v.released}{v.sunsetDate ? ` · Sunset ${v.sunsetDate}` : ''}
                        </div>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                        {v.changes.map(c => <li key={c}>{c}</li>)}
                    </ul>
                </div>
            ))}

            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', padding: '0.5rem', textAlign: 'center' }}>
                Migration guides available for each version transition. See <button className="link-btn" style={{ fontSize: '0.7rem' }} onClick={() => onNavigate('migration')}>Migration Guide</button>.
            </div>
        </div>
    );
}
