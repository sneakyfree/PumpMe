// Data Exports Page

interface Props { onNavigate: (page: string) => void; }

interface ExportJob { id: string; type: string; format: string; size: string; status: 'ready' | 'processing' | 'expired'; created: string; downloadUrl: string; }

const MOCK_EXPORTS: ExportJob[] = [
    { id: 'exp-1', type: 'Inference Logs', format: 'CSV', size: '12.4 MB', status: 'ready', created: '1 hour ago', downloadUrl: '#' },
    { id: 'exp-2', type: 'Billing History', format: 'JSON', size: '856 KB', status: 'ready', created: '3 hours ago', downloadUrl: '#' },
    { id: 'exp-3', type: 'Usage Analytics', format: 'CSV', size: '—', status: 'processing', created: '10 min ago', downloadUrl: '#' },
    { id: 'exp-4', type: 'Audit Trail', format: 'JSON', size: '2.1 MB', status: 'ready', created: '1 day ago', downloadUrl: '#' },
    { id: 'exp-5', type: 'Session Data', format: 'JSONL', size: '45.2 MB', status: 'expired', created: '8 days ago', downloadUrl: '#' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    ready: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    expired: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

const EXPORT_TYPES = [
    { type: 'Inference Logs', desc: 'All request/response logs with tokens, cost, latency', formats: ['CSV', 'JSON', 'JSONL'] },
    { type: 'Billing History', desc: 'Invoices, payments, and cost breakdowns', formats: ['CSV', 'JSON', 'PDF'] },
    { type: 'Usage Analytics', desc: 'Aggregated usage metrics and trends', formats: ['CSV', 'JSON'] },
    { type: 'Audit Trail', desc: 'Security events and user actions', formats: ['JSON'] },
    { type: 'Session Data', desc: 'Full session transcripts and metadata', formats: ['JSONL'] },
];

export default function DataExportsPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('export')}>← Export</button>
            <h1 style={{ margin: '1rem 0' }}>📦 Data Exports</h1>

            {/* New export section */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Create New Export</div>
                {EXPORT_TYPES.map(t => (
                    <div key={t.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t.type}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{t.desc}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {t.formats.map(f => (
                                <button key={f} className="btn btn-primary" style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>{f}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent exports */}
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Recent Exports</div>
            {MOCK_EXPORTS.map(exp => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{exp.type} <code style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>.{exp.format.toLowerCase()}</code></div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{exp.size} · {exp.created}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STATUS_STYLES[exp.status].bg, color: STATUS_STYLES[exp.status].color }}>{exp.status}</span>
                        {exp.status === 'ready' && <button className="btn btn-primary" style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>⬇ Download</button>}
                    </div>
                </div>
            ))}
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.5rem' }}>Exports are available for download for 7 days</div>
        </div>
    );
}
