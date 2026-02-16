// Partners Page

interface Props { onNavigate: (page: string) => void; }

const PARTNERS = [
    { name: 'Vast.ai', type: 'GPU Provider', desc: 'Peer-to-peer GPU marketplace. Lowest prices for A100 and RTX GPUs.', tier: 'Premier', icon: '🌐' },
    { name: 'RunPod', type: 'GPU Provider', desc: 'Cloud GPU platform optimized for AI/ML workloads with serverless endpoints.', tier: 'Premier', icon: '🚀' },
    { name: 'Lambda Labs', type: 'GPU Provider', desc: 'H100 cloud instances with InfiniBand networking for training and inference.', tier: 'Premier', icon: '⚡' },
    { name: 'Hugging Face', type: 'Model Hub', desc: 'Deploy any of 400K+ models directly to PumpMe with one click.', tier: 'Integration', icon: '🤗' },
    { name: 'Weights & Biases', type: 'MLOps', desc: 'Experiment tracking and model evaluation integrated with PumpMe sessions.', tier: 'Integration', icon: '📊' },
    { name: 'LangChain', type: 'Framework', desc: 'First-class PumpMe provider support in the LangChain ecosystem.', tier: 'Integration', icon: '🔗' },
    { name: 'Stripe', type: 'Payments', desc: 'Secure payment processing for credits, subscriptions, and invoicing.', tier: 'Infrastructure', icon: '💳' },
    { name: 'Cloudflare', type: 'Infrastructure', desc: 'Global CDN and DDoS protection for API endpoints worldwide.', tier: 'Infrastructure', icon: '🛡️' },
];

const TIER_COLORS: Record<string, string> = { Premier: '#f59e0b', Integration: '#00d4ff', Infrastructure: '#64748b' };

export default function PartnersPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('about')}>← About</button>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <h1 style={{ fontSize: '1.5rem' }}>🤝 Our Partners</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>The companies that power the PumpMe ecosystem.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {PARTNERS.map(p => (
                    <div key={p.name} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.3rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                            </div>
                            <span style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: `${TIER_COLORS[p.tier]}15`, color: TIER_COLORS[p.tier] }}>{p.tier}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#00d4ff', marginBottom: '0.2rem' }}>{p.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{p.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Become a Partner</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Interested in partnering with PumpMe? We'd love to hear from you.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('contact')}>Contact Us →</button>
            </div>
        </div>
    );
}
