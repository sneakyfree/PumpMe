import { useState } from 'react';

interface ChangelogEntry {
    version: string; date: string; title: string;
    changes: { type: 'added' | 'improved' | 'fixed' | 'removed'; text: string }[];
}

interface Props { onNavigate: (page: string) => void; }

const CHANGELOG: ChangelogEntry[] = [
    {
        version: '1.4.0', date: '2026-02-09', title: 'Teams, Analytics & GDPR',
        changes: [
            { type: 'added', text: 'Team management with roles (owner/admin/member)' },
            { type: 'added', text: 'Usage analytics dashboard with GPU/tier breakdowns' },
            { type: 'added', text: 'GDPR data export and account deletion' },
            { type: 'added', text: 'Status page with real-time service monitoring' },
            { type: 'improved', text: 'Feature flags with percentage rollout' },
        ],
    },
    {
        version: '1.3.0', date: '2026-02-08', title: 'Notifications & Leaderboard',
        changes: [
            { type: 'added', text: 'In-app notification center with 10 event types' },
            { type: 'added', text: 'Community leaderboard with 7-tier badge system' },
            { type: 'added', text: 'API key management with reveal-once pattern' },
            { type: 'added', text: 'Model comparison tool' },
            { type: 'added', text: 'Referral program with $5 rewards' },
        ],
    },
    {
        version: '1.2.0', date: '2026-02-07', title: 'Subscriptions & Storage',
        changes: [
            { type: 'added', text: 'Stripe subscription system with webhooks' },
            { type: 'added', text: 'S3-compatible file storage with quotas' },
            { type: 'added', text: 'Content policy enforcement filter' },
            { type: 'improved', text: 'Dashboard with real-time session stats' },
        ],
    },
    {
        version: '1.1.0', date: '2026-02-06', title: 'Admin & Landing Page',
        changes: [
            { type: 'added', text: 'Admin dashboard with user management' },
            { type: 'added', text: 'Landing page with hero, features, pricing' },
            { type: 'added', text: 'Session workspace with terminal emulator' },
            { type: 'added', text: 'VRAM calculator and model browser' },
            { type: 'fixed', text: 'Auth token refresh race condition' },
        ],
    },
    {
        version: '1.0.0', date: '2026-02-05', title: 'Initial Launch',
        changes: [
            { type: 'added', text: 'GPU session booking with real-time provisioning' },
            { type: 'added', text: 'Multi-provider support (Vast.ai, RunPod)' },
            { type: 'added', text: 'Stripe billing and credit system' },
            { type: 'added', text: 'OpenAI-compatible inference API' },
            { type: 'added', text: 'AI chat assistant' },
        ],
    },
];

export default function ChangelogPage({ onNavigate }: Props) {
    const [expanded, setExpanded] = useState<string>(CHANGELOG[0]?.version || '');
    const TYPE_COLORS: Record<string, string> = { added: '#34d399', improved: '#00d4ff', fixed: '#f59e0b', removed: '#ef4444' };
    const TYPE_LABELS: Record<string, string> = { added: 'NEW', improved: 'IMPROVED', fixed: 'FIXED', removed: 'REMOVED' };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Changelog</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Track every improvement to PumpMe.
            </p>

            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: '0.45rem', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.06)' }} />

                {CHANGELOG.map(entry => (
                    <div key={entry.version} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        {/* Timeline dot */}
                        <div style={{
                            position: 'absolute', left: '-1.25rem', top: '0.5rem', width: '10px', height: '10px',
                            borderRadius: '50%', background: expanded === entry.version ? '#00d4ff' : 'rgba(255,255,255,0.15)',
                        }} />

                        <div
                            onClick={() => setExpanded(expanded === entry.version ? '' : entry.version)}
                            style={{
                                background: 'rgba(255,255,255,0.02)', border: `1px solid ${expanded === entry.version ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '12px', padding: '0.75rem 1rem', cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 700, color: '#00d4ff', marginRight: '0.5rem' }}>v{entry.version}</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.title}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{entry.date}</span>
                            </div>

                            {expanded === entry.version && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {entry.changes.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                            <span style={{
                                                fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '3px', fontWeight: 700,
                                                background: `${TYPE_COLORS[c.type]}15`, color: TYPE_COLORS[c.type],
                                            }}>{TYPE_LABELS[c.type]}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
