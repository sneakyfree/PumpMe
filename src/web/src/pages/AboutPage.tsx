// About Page

interface Props { onNavigate: (page: string) => void; }

const TEAM = [
    { name: 'Alex Chen', role: 'CEO & Co-founder', desc: 'Ex-NVIDIA engineer. 10+ years in GPU computing.', emoji: '👨‍💻' },
    { name: 'Sarah Kim', role: 'CTO & Co-founder', desc: 'Former AWS principal engineer. Built distributed systems at scale.', emoji: '👩‍💻' },
    { name: 'Marcus Johnson', role: 'VP Engineering', desc: 'Led infrastructure at Replicate. Expert in GPU orchestration.', emoji: '🧑‍💻' },
    { name: 'Priya Patel', role: 'Head of Product', desc: 'Ex-HuggingFace. Passionate about making AI accessible.', emoji: '👩‍🔬' },
];

const STATS = [
    { label: 'GPU Hours Served', value: '2.4M+' },
    { label: 'Active Users', value: '15K+' },
    { label: 'AI Models Supported', value: '200+' },
    { label: 'Avg Spin-up Time', value: '<30s' },
];

const VALUES = [
    { emoji: '⚡', title: 'Speed First', desc: 'Sub-30-second GPU provisioning. No waiting in queues.' },
    { emoji: '💰', title: 'Fair Pricing', desc: 'Pay only for what you use. 50-70% cheaper than cloud providers.' },
    { emoji: '🔓', title: 'Open Ecosystem', desc: 'OpenAI-compatible API. Bring your own models. No vendor lock-in.' },
    { emoji: '🛡️', title: 'Enterprise Ready', desc: 'SOC 2 compliant. Isolated containers. End-to-end encryption.' },
];

export default function AboutPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>

            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Making GPU Computing <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Accessible</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                    PumpMe democratizes access to GPU computing. Run any AI model on enterprise-grade hardware, pay by the minute.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                {STATS.map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#00d4ff' }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Values */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Our Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                {VALUES.map(v => (
                    <div key={v.title} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{v.emoji}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{v.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{v.desc}</div>
                    </div>
                ))}
            </div>

            {/* Team */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>The Team</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                {TEAM.map(t => (
                    <div key={t.name} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                        <div style={{ fontSize: '2rem' }}>{t.emoji}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#00d4ff', marginBottom: '0.2rem' }}>{t.role}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{t.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.1)' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Ready to start pumping?</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>Join 15,000+ developers running AI on PumpMe.</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => onNavigate('register')}>🚀 Get Started Free</button>
                    <button className="btn" onClick={() => onNavigate('contact')}>Contact Sales</button>
                </div>
            </div>
        </div>
    );
}
