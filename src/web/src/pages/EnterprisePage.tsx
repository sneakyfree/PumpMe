// Enterprise Page

interface Props { onNavigate: (page: string) => void; }

const FEATURES = [
    { icon: '🔒', title: 'SSO / SAML', desc: 'Single sign-on with Okta, Auth0, Azure AD, and any SAML 2.0 provider.' },
    { icon: '📋', title: 'SLA Guarantee', desc: '99.95% uptime SLA with dedicated SRE support and priority incident resolution.' },
    { icon: '🏢', title: 'Dedicated GPUs', desc: 'Reserved GPU capacity with guaranteed availability. No cold starts, no queuing.' },
    { icon: '💰', title: 'Volume Pricing', desc: 'Custom pricing tiers starting at $10K/month. Up to 60% savings vs. pay-as-you-go.' },
    { icon: '🛡️', title: 'SOC 2 Type II', desc: 'Fully audited compliance. BAA available for HIPAA-covered entities.' },
    { icon: '🌍', title: 'Multi-Region', desc: 'Deploy in US, EU, or Asia. Data residency guarantees for compliance.' },
    { icon: '👥', title: 'Team Management', desc: 'Role-based access control, audit logs, and centralized billing for teams.' },
    { icon: '📞', title: 'Dedicated Support', desc: 'Named account manager, Slack channel, and 1-hour response time SLA.' },
];

export default function EnterprisePage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('pricing')}>← Pricing</button>

            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(124,58,237,0.15)', color: '#7c3aed', marginBottom: '0.5rem', display: 'inline-block' }}>ENTERPRISE</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0' }}>GPU Infrastructure for <span style={{ color: '#00d4ff' }}>Scale</span></h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
                    Custom plans for teams processing millions of tokens. Dedicated GPUs, priority support, and enterprise-grade security.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                {FEATURES.map(f => (
                    <div key={f.title} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{f.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>{f.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{f.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Enterprise Customers', value: '120+' },
                    { label: 'GPU Hours/Month', value: '2M+' },
                    { label: 'Avg Cost Savings', value: '45%' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00d4ff' }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} onClick={() => onNavigate('contact')}>Talk to Sales →</button>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>No commitment required · Custom demo available</div>
            </div>
        </div>
    );
}
