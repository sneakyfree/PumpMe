import { useState, useEffect } from 'react';

interface Webhook { id: string; url: string; secret: string; events: string[]; active: boolean; createdAt: string; lastDelivery: string | null; failureCount: number; }
interface Props { onNavigate: (page: string) => void; }

export default function WebhookPage({ onNavigate }: Props) {
    const [hooks, setHooks] = useState<Webhook[]>([]);
    const [events, setEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newEvents, setNewEvents] = useState<string[]>([]);
    const [testing, setTesting] = useState('');

    useEffect(() => { loadHooks(); }, []);

    const loadHooks = async () => {
        try {
            const res = await fetch('/api/webhooks', { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setHooks(d.data?.webhooks || []); setEvents(d.data?.availableEvents || []); }
        } catch { /* */ }
        setLoading(false);
    };

    const create = async () => {
        if (!newUrl || !newEvents.length) return;
        try {
            const res = await fetch('/api/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ url: newUrl, events: newEvents }) });
            if (res.ok) { setShowCreate(false); setNewUrl(''); setNewEvents([]); loadHooks(); }
        } catch { /* */ }
    };

    const remove = async (id: string) => {
        await fetch(`/api/webhooks/${id}`, { method: 'DELETE', credentials: 'include' });
        loadHooks();
    };

    const test = async (id: string) => {
        setTesting(id);
        await fetch(`/api/webhooks/${id}/test`, { method: 'POST', credentials: 'include' });
        setTesting('');
        loadHooks();
    };

    const toggleEvent = (e: string) => setNewEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>🔗 Webhooks</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)} style={{ fontSize: '0.8rem' }}>
                    {showCreate ? '✕ Cancel' : '+ New Webhook'}
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Endpoint URL</label>
                        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://your-server.com/webhook" style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginTop: '0.25rem' }} />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Events</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {events.map(e => (
                                <button key={e} onClick={() => toggleEvent(e)} style={{
                                    padding: '0.2rem 0.4rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace',
                                    background: newEvents.includes(e) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                                    color: newEvents.includes(e) ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                                }}>{e}</button>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={create} disabled={!newUrl || !newEvents.length} style={{ fontSize: '0.8rem' }}>
                        Create Webhook ({newEvents.length} events)
                    </button>
                </div>
            )}

            {/* Webhook list */}
            {hooks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    No webhooks configured. Create one to receive real-time event notifications.
                </div>
            ) : hooks.map(h => (
                <div key={h.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.35rem' }}>
                        <div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00d4ff', wordBreak: 'break-all' }}>{h.url}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>
                                Secret: <code>{h.secret}</code> · {h.events.length} events · {h.failureCount > 0 ? `⚠️ ${h.failureCount} failures` : '✅ Healthy'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={() => test(h.id)} disabled={testing === h.id} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}>
                                {testing === h.id ? '⏳' : '🧪 Test'}
                            </button>
                            <button onClick={() => remove(h.id)} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>🗑️</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                        {h.events.map(e => (
                            <span key={e} style={{ fontSize: '0.6rem', padding: '0.1rem 0.25rem', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{e}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
