// Careers Page

interface Props { onNavigate: (page: string) => void; }

interface Job { title: string; dept: string; location: string; type: string; desc: string; }

const JOBS: Job[] = [
    { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote (US/EU)', type: 'Full-time', desc: 'Build GPU orchestration systems handling 2M+ hours/month. Golang, Kubernetes, distributed systems.' },
    { title: 'ML Infrastructure Engineer', dept: 'Engineering', location: 'Remote (Global)', type: 'Full-time', desc: 'Optimize vLLM serving, build model routing, implement speculative decoding at scale.' },
    { title: 'Frontend Engineer (React)', dept: 'Engineering', location: 'Remote (US)', type: 'Full-time', desc: 'Build the developer dashboard and playground. React, TypeScript, real-time data visualization.' },
    { title: 'Developer Advocate', dept: 'DevRel', location: 'Remote (US/EU)', type: 'Full-time', desc: 'Create tutorials, speak at conferences, build community. Deep ML/AI experience required.' },
    { title: 'Product Designer', dept: 'Design', location: 'Remote (US)', type: 'Full-time', desc: 'Design developer tools that are beautiful and functional. Figma, design systems, data-heavy UIs.' },
    { title: 'Site Reliability Engineer', dept: 'Infrastructure', location: 'Remote (US/EU)', type: 'Full-time', desc: 'Keep 99.95% uptime across multi-cloud GPU infrastructure. Terraform, Prometheus, PagerDuty.' },
];

const PERKS = [
    { emoji: '🌍', label: 'Fully Remote' },
    { emoji: '💰', label: 'Competitive Equity' },
    { emoji: '🏖️', label: 'Unlimited PTO' },
    { emoji: '🖥️', label: 'GPU Credits' },
    { emoji: '📚', label: '$3K Learning Budget' },
    { emoji: '🏥', label: 'Premium Healthcare' },
];

export default function CareersPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('about')}>← About</button>

            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Join the <span style={{ color: '#00d4ff' }}>PumpMe</span> Team</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Help us make GPU computing accessible to every developer.</p>
            </div>

            {/* Perks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                {PERKS.map(p => (
                    <div key={p.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '1.2rem' }}>{p.emoji}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{p.label}</div>
                    </div>
                ))}
            </div>

            {/* Open positions */}
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Open Positions ({JOBS.length})</h2>
            {JOBS.map(job => (
                <div key={job.title} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.title}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{job.dept}</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{job.location} · {job.type}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Apply →</button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem', lineHeight: 1.4 }}>{job.desc}</div>
                </div>
            ))}
        </div>
    );
}
