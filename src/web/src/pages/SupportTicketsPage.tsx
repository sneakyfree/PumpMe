import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Ticket { id: string; subject: string; status: 'open' | 'in-progress' | 'resolved' | 'closed'; priority: 'low' | 'medium' | 'high' | 'urgent'; created: string; lastUpdate: string; category: string; }

const MOCK_TICKETS: Ticket[] = [
    { id: 'TKT-1042', subject: 'Webhook delivery failures to our endpoint', status: 'in-progress', priority: 'high', created: '2 hours ago', lastUpdate: '30 min ago', category: 'Webhooks' },
    { id: 'TKT-1041', subject: 'Request for SOC 2 report access', status: 'open', priority: 'medium', created: '1 day ago', lastUpdate: '6 hours ago', category: 'Compliance' },
    { id: 'TKT-1039', subject: 'Fine-tuning job stuck at 43%', status: 'resolved', priority: 'high', created: '3 days ago', lastUpdate: '1 day ago', category: 'Training' },
    { id: 'TKT-1035', subject: 'Billing discrepancy for January invoice', status: 'closed', priority: 'medium', created: '1 week ago', lastUpdate: '3 days ago', category: 'Billing' },
    { id: 'TKT-1030', subject: 'Custom model returning 503 errors', status: 'resolved', priority: 'urgent', created: '2 weeks ago', lastUpdate: '1 week ago', category: 'Inference' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    'open': { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    'in-progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    'resolved': { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    'closed': { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

const PRIORITY_COLORS: Record<string, string> = { low: '#64748b', medium: '#00d4ff', high: '#f59e0b', urgent: '#ef4444' };

export default function SupportTicketsPage({ onNavigate }: Props) {
    const [tickets] = useState(MOCK_TICKETS);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('help')}>← Help Center</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>🎫 Support Tickets</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ New Ticket</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#00d4ff' },
                    { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
                    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#34d399' },
                    { label: 'Avg Response', value: '< 4h', color: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {tickets.map(t => (
                <div key={t.id} style={{ padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{t.id}</code>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PRIORITY_COLORS[t.priority] }} title={t.priority} />
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.subject}</span>
                        </div>
                        <span style={{ padding: '0.05rem 0.25rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STATUS_STYLES[t.status].bg, color: STATUS_STYLES[t.status].color }}>{t.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                        <span>{t.category}</span>
                        <span>Created {t.created}</span>
                        <span>Updated {t.lastUpdate}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
