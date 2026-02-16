// Developer Portal Page

interface Props { onNavigate: (page: string) => void; }

const RESOURCES = [
    { icon: '📖', title: 'API Documentation', desc: 'Complete reference for all endpoints, parameters, and response formats', page: 'docs' },
    { icon: '🚀', title: 'Quickstart Guide', desc: 'Get your first API call running in under 2 minutes', page: 'quickstart' },
    { icon: '💻', title: 'Code Samples', desc: 'Ready-to-use examples in Python, Node.js, and cURL', page: 'code-samples' },
    { icon: '📦', title: 'SDK Libraries', desc: 'Official client libraries for Python, Node.js, and CLI', page: 'sdk-docs' },
    { icon: '🔑', title: 'API Keys', desc: 'Manage your API keys and access tokens', page: 'api-keys' },
    { icon: '🏗️', title: 'Playground', desc: 'Test models interactively with real-time responses', page: 'playground' },
    { icon: '📊', title: 'Usage Analytics', desc: 'Monitor token usage, costs, and performance metrics', page: 'api-usage' },
    { icon: '📋', title: 'Changelog', desc: 'Track API updates, new features, and deprecations', page: 'release-notes' },
    { icon: '❓', title: 'Error Codes', desc: 'HTTP status codes and how to resolve common errors', page: 'error-codes' },
    { icon: '⚡', title: 'Rate Limits', desc: 'Understand rate limits by tier and endpoint', page: 'rate-limits' },
    { icon: '📖', title: 'Glossary', desc: 'AI/ML terminology and PumpMe-specific concepts', page: 'glossary' },
    { icon: '🎫', title: 'Support', desc: 'Open a ticket or browse the knowledge base', page: 'support-tickets' },
];

export default function DevPortalPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>🛠️ Developer Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Everything you need to build with PumpMe. From quickstart guides to advanced API reference.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'API Version', value: 'v2.8', color: '#00d4ff' },
                    { label: 'Uptime', value: '99.97%', color: '#34d399' },
                    { label: 'Avg Latency', value: '148ms', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {RESOURCES.map(r => (
                    <div key={r.title} onClick={() => onNavigate(r.page)} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.1rem' }}>{r.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{r.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
