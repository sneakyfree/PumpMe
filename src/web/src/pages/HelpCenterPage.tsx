import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const HELP_CATEGORIES = [
    {
        emoji: '🚀', title: 'Getting Started',
        articles: [
            { q: 'How do I launch my first GPU session?', a: 'Go to the Marketplace, pick a GPU, select your model, and click "Pump". Your session will be ready in under 30 seconds.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit cards via Stripe, plus prepaid credit packages for volume users.' },
            { q: 'How do I add credits?', a: 'Navigate to Billing → Add Credits. Choose a package or enter a custom amount.' },
        ],
    },
    {
        emoji: '🔑', title: 'API & Integration',
        articles: [
            { q: 'How do I get an API key?', a: 'Go to API Keys in your dashboard and click "Generate New Key". Your key is shown once — save it securely.' },
            { q: 'Is the API OpenAI-compatible?', a: 'Yes! Point your OpenAI SDK to our endpoint and use your PumpMe API key. All /v1/chat/completions endpoints work.' },
            { q: 'How do I set up webhooks?', a: 'Go to Settings → Webhooks, add your endpoint URL, select events, and we\'ll deliver signed payloads via POST.' },
        ],
    },
    {
        emoji: '💰', title: 'Billing & Pricing',
        articles: [
            { q: 'How does per-minute billing work?', a: 'You\'re charged per minute of GPU time used. Billing starts when your session is "running" and stops when terminated.' },
            { q: 'Can I get a refund?', a: 'We offer refunds for sessions that fail due to provider issues. Contact support with your session ID.' },
            { q: 'What happens if I run out of credits?', a: 'Active sessions continue but new sessions are blocked. Add credits to resume. Enterprise users have net-30 billing.' },
        ],
    },
    {
        emoji: '🛡️', title: 'Security & Privacy',
        articles: [
            { q: 'How is my data protected?', a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Sessions run in isolated containers.' },
            { q: 'Can I export my data?', a: 'Yes! Go to Export → GDPR Export for a full JSON download of all your data per GDPR Article 20.' },
            { q: 'How do I enable 2FA?', a: 'Go to Security settings and toggle Two-Factor Authentication. Scan the QR code with your authenticator app.' },
        ],
    },
];

export default function HelpCenterPage({ onNavigate }: Props) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = search
        ? HELP_CATEGORIES.map(c => ({ ...c, articles: c.articles.filter(a => a.q.toLowerCase().includes(search.toLowerCase()) || a.a.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.articles.length > 0)
        : HELP_CATEGORIES;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>❓ Help Center</h1>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help articles..." style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem' }} />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.3 }}>🔍</span>
            </div>

            {/* Categories */}
            {filtered.map(cat => (
                <div key={cat.title} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>{cat.emoji} {cat.title}</div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                        {cat.articles.map((a, i) => {
                            const key = `${cat.title}-${i}`;
                            const isOpen = expanded === key;
                            return (
                                <div key={i} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <button onClick={() => setExpanded(isOpen ? null : key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <span>{a.q}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
                                    </button>
                                    {isOpen && <div style={{ padding: '0 1rem 0.65rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{a.a}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Contact */}
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '12px', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Still need help?</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>Our support team typically responds within 2 hours.</div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => onNavigate('feedback')} style={{ fontSize: '0.8rem' }}>📧 Contact Support</button>
                    <button className="btn" onClick={() => onNavigate('community')} style={{ fontSize: '0.8rem' }}>💬 Discord</button>
                </div>
            </div>
        </div>
    );
}
