// Compliance Page

interface Props { onNavigate: (page: string) => void; }

const CERTS = [
    { icon: '🏛️', name: 'SOC 2 Type II', status: 'Certified', date: 'Jan 2026', desc: 'Annual audit by Deloitte. Report available under NDA for Enterprise customers.' },
    { icon: '🇪🇺', name: 'GDPR', status: 'Compliant', date: 'Ongoing', desc: 'Data Processing Agreement (DPA) available. EU data residency option. Right to erasure supported.' },
    { icon: '🏥', name: 'HIPAA', status: 'BAA Available', date: 'Enterprise', desc: 'Business Associate Agreement available for covered entities on Enterprise plans.' },
    { icon: '🔒', name: 'ISO 27001', status: 'In Progress', date: 'Q2 2026', desc: 'Information security management system certification in progress.' },
    { icon: '🇺🇸', name: 'CCPA', status: 'Compliant', date: 'Ongoing', desc: 'California Consumer Privacy Act compliance. Do Not Sell option available.' },
    { icon: '💳', name: 'PCI DSS', status: 'Level 1', date: 'Current', desc: 'Payment card data handled by Stripe. No card data touches PumpMe servers.' },
];

export default function CompliancePage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('trust-safety')}>← Trust & Safety</button>
            <h1 style={{ margin: '1rem 0' }}>📜 Compliance</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Industry certifications and regulatory compliance for enterprise-grade AI infrastructure.
            </p>

            {CERTS.map(cert => (
                <div key={cert.name} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{cert.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cert.name}</span>
                            <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, background: cert.status === 'In Progress' ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)', color: cert.status === 'In Progress' ? '#f59e0b' : '#34d399' }}>{cert.status}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{cert.desc}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.2rem' }}>{cert.date}</div>
                    </div>
                </div>
            ))}

            <div style={{ padding: '0.75rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px', textAlign: 'center', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem' }}>Need compliance documentation?</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>SOC 2 reports and DPAs are available to Enterprise customers. <button className="link-btn" style={{ fontSize: '0.7rem' }} onClick={() => onNavigate('contact')}>Contact Sales</button></div>
            </div>
        </div>
    );
}
