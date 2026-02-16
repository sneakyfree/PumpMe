import { useState, useEffect } from 'react';

interface Ticket { id: string; type: string; subject: string; status: string; priority: string; createdAt: string; }
interface Props { onNavigate: (page: string) => void; }

export default function FeedbackPage({ onNavigate }: Props) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('general');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => { loadTickets(); }, []);

    const loadTickets = async () => {
        try {
            const res = await fetch('/api/feedback', { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setTickets(d.data?.tickets || []); }
        } catch { /* */ }
        setLoading(false);
    };

    const submitFeedback = async () => {
        if (!message.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ type: formType, subject, message, rating: rating || undefined }),
            });
            if (res.ok) {
                setSuccess('Feedback submitted! 🎉'); setShowForm(false);
                setSubject(''); setMessage(''); setRating(0);
                await loadTickets();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch { /* */ }
        setSubmitting(false);
    };

    const STATUS_C: Record<string, string> = { open: '#00d4ff', in_progress: '#f59e0b', resolved: '#34d399', closed: '#94a3b8' };
    const PRIO_C: Record<string, string> = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444' };
    const ICONS: Record<string, string> = { bug: '🐛', feature: '💡', general: '💬', support: '🆘', complaint: '😤', praise: '🌟' };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>💬 Feedback & Support</h1>

            {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#34d399' }}>{success}</div>}

            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1.5rem' }}>
                {showForm ? '✕ Cancel' : '+ Submit Feedback'}
            </button>

            {showForm && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {['bug', 'feature', 'general', 'support', 'complaint', 'praise'].map(t => (
                            <button key={t} onClick={() => setFormType(t)} style={{
                                padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                                background: formType === t ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${formType === t ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                color: formType === t ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                            }}>{ICONS[t]} {t}</button>
                        ))}
                    </div>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (optional)" style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your feedback..." rows={4} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginRight: '0.5rem' }}>Rating:</span>
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRating(s === rating ? 0 : s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>{s <= rating ? '⭐' : '☆'}</button>
                        ))}
                    </div>
                    <button className="btn btn-primary" onClick={submitFeedback} disabled={submitting || !message.trim()}>
                        {submitting ? '⏳...' : '🚀 Submit'}
                    </button>
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}
            {!loading && tickets.length === 0 && !showForm && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                    <p>No feedback yet. We'd love to hear from you!</p>
                </div>
            )}
            {!loading && tickets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tickets.map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>{ICONS[t.type] || '💬'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t.subject}</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleDateString()} · {t.type}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: `${STATUS_C[t.status] || '#94a3b8'}15`, color: STATUS_C[t.status] || '#94a3b8' }}>{t.status}</span>
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: `${PRIO_C[t.priority] || '#94a3b8'}15`, color: PRIO_C[t.priority] || '#94a3b8' }}>{t.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
