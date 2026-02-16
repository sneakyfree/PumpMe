/**
 * Landing Page — high-conversion marketing page
 *
 * Better than the minimal hero. Feature grid, social proof, CTA sections.
 * FEAT-121: Marketing landing page
 */

import './LandingPage.css';

interface Props {
    onNavigate: (page: string) => void;
}

const FEATURES = [
    { icon: '⚡', title: 'Instant On', desc: 'GPU ready in 30 seconds. No setup. No Docker. No SSH.' },
    { icon: '🧠', title: '50+ Models', desc: 'Llama 3, Mistral, Gemma, SDXL, Whisper — pre-loaded and ready.' },
    { icon: '💰', title: 'Pay Per Minute', desc: 'No subscriptions required. $0.29/min for RTX 5090. Beast mode $0.89/min.' },
    { icon: '🔌', title: 'OpenAI Drop-In', desc: 'Same API, your GPUs. Replace one URL and keep your existing code.' },
    { icon: '🏠', title: 'Pump Home', desc: 'Persistent storage. Your models, your data, always there when you come back.' },
    { icon: '🛡️', title: 'Enterprise Ready', desc: 'SOC 2 Type II on the roadmap. Audit logs. GDPR compliant.' },
];

const TIERS = [
    { name: 'Starter', gpu: 'RTX 4090', vram: '24 GB', price: '$0.15', color: '#34d399' },
    { name: 'Pro', gpu: 'RTX 5090', vram: '32 GB', price: '$0.29', color: '#00d4ff' },
    { name: 'Beast', gpu: '8x H100', vram: '640 GB', price: '$0.89', color: '#7c3aed', popular: true },
    { name: 'Ultra', gpu: 'B300 Cluster', vram: '1.5 TB', price: '$1.79', color: '#ff3b30' },
];

const TESTIMONIALS = [
    { name: 'Sarah K.', role: 'ML Engineer', text: 'I replaced my $200/month cloud GPU with Pump Me. Same speed, 60% cheaper.', avatar: '👩‍💻' },
    { name: 'Mike R.', role: 'AI Researcher', text: 'Fine-tuned Llama 70B in 47 minutes on Beast mode. Insane.', avatar: '🧑‍🔬' },
    { name: 'Alex T.', role: 'Startup CTO', text: 'We moved our entire inference stack here. API swap took 5 minutes.', avatar: '🧑‍💼' },
];

export default function LandingPage({ onNavigate }: Props) {
    return (
        <div className="landing">
            {/* Hero */}
            <section className="landing-hero">
                <div className="hero-badge">🆕 Now with Ultra-tier B300 Clusters</div>
                <h1 className="hero-title">
                    GPU Compute<br />
                    <span className="gradient-text">Without the BS</span>
                </h1>
                <p className="hero-subtitle">
                    Show up. Click. Feel the speed. Run any AI model on beast-mode GPUs — no setup, no SSH, no Docker. Just raw compute.
                </p>
                <div className="hero-cta">
                    <button className="btn btn-primary btn-lg" onClick={() => onNavigate('register')}>
                        🔥 Try Beast Mode Free
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('pricing')}>
                        View Pricing
                    </button>
                </div>
                <p className="hero-note">5 minutes of Beast mode (8x H100) — free. No credit card.</p>
            </section>

            {/* Features */}
            <section className="landing-section">
                <h2 className="section-title">Everything You Need to Pump</h2>
                <div className="feature-grid">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tiers */}
            <section className="landing-section">
                <h2 className="section-title">Pick Your Power Level</h2>
                <div className="tier-grid">
                    {TIERS.map((t, i) => (
                        <div key={i} className={`tier-card ${t.popular ? 'popular' : ''}`} style={{ borderColor: `${t.color}33` }}>
                            {t.popular && <div className="popular-badge" style={{ background: `linear-gradient(135deg, ${t.color}, #00d4ff)` }}>MOST POPULAR</div>}
                            <h3 style={{ color: t.color }}>{t.name}</h3>
                            <div className="tier-gpu">{t.gpu}</div>
                            <div className="tier-vram">{t.vram} VRAM</div>
                            <div className="tier-price">{t.price}<span>/min</span></div>
                            <button className="btn btn-primary" onClick={() => onNavigate('register')} style={{ width: '100%' }}>
                                Start Pumping
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Social Proof */}
            <section className="landing-section">
                <h2 className="section-title">People Love Pumping</h2>
                <div className="testimonial-grid">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="testimonial-card">
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <span className="avatar">{t.avatar}</span>
                                <div>
                                    <div className="author-name">{t.name}</div>
                                    <div className="author-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-section landing-cta">
                <h2>Ready to Pump?</h2>
                <p>Join thousands of developers running AI at full speed.</p>
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate('register')}>
                    🚀 Get Started Free
                </button>
            </section>
        </div>
    );
}
