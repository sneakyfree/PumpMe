import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function ExportPage({ onNavigate }: Props) {
    const [exporting, setExporting] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [format, setFormat] = useState<'csv' | 'json'>('csv');

    const doExport = async (type: 'sessions' | 'transactions') => {
        setExporting(type);
        try {
            const params = new URLSearchParams({ format });
            if (dateRange.from) params.set('from', dateRange.from);
            if (dateRange.to) params.set('to', dateRange.to);

            const res = await fetch(`/api/export/${type}?${params}`, { credentials: 'include' });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pumpme-${type}-${Date.now()}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch { /* */ }
        setExporting('');
    };

    const doGdprExport = async () => {
        setExporting('gdpr');
        try {
            const res = await fetch('/api/gdpr/export', { method: 'POST', credentials: 'include' });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `pumpme-full-export-${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
            }
        } catch { /* */ }
        setExporting('');
    };

    const EXPORTS = [
        { type: 'sessions' as const, emoji: '🚀', title: 'Session History', desc: 'GPU sessions, duration, costs, models used' },
        { type: 'transactions' as const, emoji: '💳', title: 'Transaction History', desc: 'Payments, credits, refunds, subscriptions' },
    ];

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>📥 Export Data</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Download your PumpMe data in CSV or JSON format.
            </p>

            {/* Format & date range */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Options</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Format</label>
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {(['csv', 'json'] as const).map(f => (
                                <button key={f} onClick={() => setFormat(f)} style={{
                                    padding: '0.3rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase',
                                    background: format === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                                    color: format === f ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                                }}>{f}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>From</label>
                        <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))} style={{ display: 'block', marginTop: '0.25rem', padding: '0.3rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>To</label>
                        <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))} style={{ display: 'block', marginTop: '0.25rem', padding: '0.3rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }} />
                    </div>
                </div>
            </div>

            {/* Export cards */}
            {EXPORTS.map(e => (
                <div key={e.type} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.5rem' }}>{e.emoji}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{e.desc}</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => doExport(e.type)} disabled={!!exporting} style={{ fontSize: '0.8rem' }}>
                        {exporting === e.type ? '⏳...' : `📥 ${format.toUpperCase()}`}
                    </button>
                </div>
            ))}

            {/* GDPR full export */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>🔒 Full GDPR Export</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>
                    Download all your personal data as required by GDPR Article 20 (Right to Data Portability).
                </p>
                <button className="btn" onClick={doGdprExport} disabled={!!exporting} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.8rem' }}>
                    {exporting === 'gdpr' ? '⏳ Exporting...' : '📦 Download All Data'}
                </button>
            </div>
        </div>
    );
}
