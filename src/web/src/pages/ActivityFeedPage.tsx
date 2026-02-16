import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Activity { id: string; type: 'session' | 'billing' | 'api' | 'team' | 'system'; action: string; detail: string; time: string; }

const FEED: Activity[] = [
    { id: '1', type: 'session', action: 'Session started', detail: 'Llama 3.1 70B on A100 80GB (Vast.ai)', time: '2 min ago' },
    { id: '2', type: 'api', action: 'API key used', detail: 'pm-prod-*** made 42 requests', time: '15 min ago' },
    { id: '3', type: 'session', action: 'Session completed', detail: 'Mistral 7B — 45 min, $0.38', time: '1 hour ago' },
    { id: '4', type: 'billing', action: 'Credits added', detail: '$50.00 via Stripe', time: '3 hours ago' },
    { id: '5', type: 'team', action: 'Team member joined', detail: 'alice@company.com accepted invite', time: '5 hours ago' },
    { id: '6', type: 'system', action: 'Webhook delivered', detail: 'session.completed → https://webhook.site/...', time: '5 hours ago' },
    { id: '7', type: 'api', action: 'API key created', detail: 'pm-staging-*** for testing', time: '1 day ago' },
    { id: '8', type: 'session', action: 'Session failed', detail: 'Provider timeout — auto-failover to RunPod', time: '1 day ago' },
    { id: '9', type: 'billing', action: 'Invoice generated', detail: 'February 2026 — $127.40', time: '2 days ago' },
    { id: '10', type: 'system', action: 'Model favorited', detail: 'Added CodeLlama-34b to favorites', time: '3 days ago' },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    session: { icon: '🖥️', color: '#00d4ff' },
    billing: { icon: '💳', color: '#34d399' },
    api: { icon: '🔑', color: '#f59e0b' },
    team: { icon: '👥', color: '#7c3aed' },
    system: { icon: '⚙️', color: '#64748b' },
};

export default function ActivityFeedPage({ onNavigate }: Props) {
    const [filter, setFilter] = useState<string>('all');

    const filtered = filter === 'all' ? FEED : FEED.filter(a => a.type === filter);

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>📡 Activity Feed</h1>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {['all', 'session', 'billing', 'api', 'team', 'system'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'capitalize',
                        background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    }}>{f}</button>
                ))}
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.04)' }} />
                {filtered.map(a => (
                    <div key={a.id} style={{ position: 'relative', marginBottom: '0.75rem' }}>
                        <div style={{ position: 'absolute', left: '-2rem', top: '0.2rem', width: '24px', height: '24px', borderRadius: '50%', background: `${TYPE_ICONS[a.type].color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', border: `2px solid ${TYPE_ICONS[a.type].color}30`, zIndex: 1 }}>
                            {TYPE_ICONS[a.type].icon}
                        </div>
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.85rem' }}>{a.action}</strong>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>{a.time}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{a.detail}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
