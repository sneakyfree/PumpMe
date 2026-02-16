// Trust & Safety Page

interface Props { onNavigate: (page: string) => void; }

const POLICIES = [
    {
        icon: '🛡️', title: 'Content Safety',
        desc: 'All inference requests are optionally screened through Llama Guard 3 for harmful content detection across 13 categories.',
        details: ['Violence & gore', 'Sexual content', 'Self-harm', 'Illegal activities', 'Harassment', 'Misinformation'],
    },
    {
        icon: '🔐', title: 'Data Privacy',
        desc: 'Your prompts and completions are never used for training. Data is encrypted at rest (AES-256) and in transit (TLS 1.3).',
        details: ['Zero data retention on inference', 'SOC 2 Type II compliant', 'GDPR-ready DPA available', 'Right to deletion'],
    },
    {
        icon: '⚖️', title: 'Fair Use',
        desc: 'Automated abuse detection prevents platform misuse. Rate limits and usage monitoring protect all users.',
        details: ['Automated rate limiting', 'Anomaly detection', 'Account suspension for ToS violations', 'Appeal process'],
    },
    {
        icon: '🔍', title: 'Transparency',
        desc: 'We publish regular transparency reports, open-source our safety tools, and maintain a public vulnerability disclosure program.',
        details: ['Quarterly transparency reports', 'Open-source safety tools', 'Bug bounty program', 'Incident post-mortems'],
    },
];

export default function TrustSafetyPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('about')}>← About</button>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <h1 style={{ fontSize: '1.5rem' }}>🛡️ Trust & Safety</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                    Building responsible AI infrastructure with security, privacy, and transparency at the core.
                </p>
            </div>

            {POLICIES.map(policy => (
                <div key={policy.title} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{policy.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{policy.title}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{policy.desc}</p>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {policy.details.map(d => (
                            <span key={d} style={{ padding: '0.15rem 0.4rem', borderRadius: '12px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>{d}</span>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ padding: '1rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>🐛 Report a Vulnerability</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Found a security issue? We have a responsible disclosure program with rewards up to $10,000.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('contact')}>Report Issue →</button>
            </div>
        </div>
    );
}
