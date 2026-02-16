import { useState, useEffect } from 'react';

interface AuditEntry { id: string; userId: string; action: string; resource: string; resourceId: string; metadata: string; ipAddress: string; userAgent: string; createdAt: string; }
interface Props { onNavigate: (page: string) => void; }

export default function AuditLogPage({ onNavigate }: Props) {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('');
    const PER_PAGE = 25;

    useEffect(() => { loadLogs(); }, [page, filter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
            if (filter) params.set('action', filter);
            const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setLogs(d.data?.logs || []); setTotal(d.data?.total || 0); }
        } catch { /* */ }
        setLoading(false);
    };

    const ACTION_ICONS: Record<string, string> = {
        'user.login': '🔑', 'user.register': '📝', 'user.logout': '🚪',
        'session.create': '🚀', 'session.end': '⏹️', 'session.fail': '❌',
        'payment.charge': '💳', 'payment.credit': '💰', 'api_key.create': '🔐',
        'api_key.revoke': '🗑️', 'admin.action': '👑', 'gdpr.export': '📦',
        'gdpr.delete': '⚠️',
    };

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('admin')}>← Admin</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Audit Log</h1>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['', 'user.login', 'session.create', 'payment.charge', 'api_key.create', 'admin.action'].map(f => (
                    <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{
                        padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                        background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                    }}>{f || 'All'}</button>
                ))}
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: 'auto' }}>
                    {total} entries
                </span>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 1fr 10rem', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    <span></span><span>Action</span><span>Resource</span><span>IP</span><span>Time</span>
                </div>

                {logs.map(log => (
                    <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 1fr 10rem', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', alignItems: 'center' }}>
                        <span>{ACTION_ICONS[log.action] || '📝'}</span>
                        <span style={{ color: '#00d4ff', fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.action}</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{log.resource}:{log.resourceId?.slice(0, 8)}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{log.ipAddress}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                ))}

                {!loading && logs.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No audit entries found</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: 'none', color: '#fff', cursor: page > 1 ? 'pointer' : 'default', opacity: page > 1 ? 1 : 0.3 }}>←</button>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: 'none', color: '#fff', cursor: page < totalPages ? 'pointer' : 'default', opacity: page < totalPages ? 1 : 0.3 }}>→</button>
                </div>
            )}
        </div>
    );
}
