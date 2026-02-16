// Release Notes Page

interface Props { onNavigate: (page: string) => void; }

interface Release { version: string; date: string; highlights: string[]; breaking: string[]; fixes: string[]; }

const RELEASES: Release[] = [
    { version: 'v2.8.0', date: 'Feb 5, 2026', highlights: ['Prompt caching with semantic matching', 'Custom model management dashboard', 'Guardrails configuration UI', 'Network peering status page'], breaking: [], fixes: ['Fixed webhook retry timing', 'Resolved batch job progress tracking'] },
    { version: 'v2.7.0', date: 'Jan 22, 2026', highlights: ['Model leaderboard with ELO rankings', 'Inference logs with cache indicators', 'Cost breakdown visualization', 'Embeddings playground'], breaking: ['Deprecated /v1.0 endpoints (sunset March 2026)'], fixes: ['Fixed token counter for multi-byte characters', 'Resolved SSO redirect loop'] },
    { version: 'v2.6.0', date: 'Jan 8, 2026', highlights: ['Uptime monitor with 30-day history', 'Model catalog with filtering', 'Trust & safety policy center', 'Compliance certifications page'], breaking: [], fixes: ['Fixed enterprise SSO metadata parsing', 'Resolved fine-tuning checkpoint corruption'] },
    { version: 'v2.5.0', date: 'Dec 18, 2025', highlights: ['Batch inference jobs', 'Enterprise features page', 'Error codes reference', 'SDK documentation hub'], breaking: ['Webhook payload format v2 (backward compatible)'], fixes: ['Fixed rate limiting for streaming requests', 'Resolved billing timezone discrepancies'] },
];

export default function ReleaseNotesPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('changelog')}>← Changelog</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Release Notes</h1>

            {RELEASES.map(r => (
                <div key={r.version} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#00d4ff' }}>{r.version}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{r.date}</span>
                    </div>

                    <div style={{ marginBottom: '0.4rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34d399', marginBottom: '0.2rem' }}>✨ Highlights</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                            {r.highlights.map(h => <li key={h}>{h}</li>)}
                        </ul>
                    </div>

                    {r.breaking.length > 0 && (
                        <div style={{ marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.2rem' }}>⚠️ Breaking Changes</div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                {r.breaking.map(b => <li key={b}>{b}</li>)}
                            </ul>
                        </div>
                    )}

                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.2rem' }}>🐛 Bug Fixes</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                            {r.fixes.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
