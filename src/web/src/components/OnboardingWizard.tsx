import { useState } from 'react';

interface Props { onNavigate?: (page: string) => void; user: { name?: string } | null; onComplete: () => void; }

const STEPS = [
    { emoji: '👋', title: 'Welcome to PumpMe', desc: 'The fastest way to run AI models on cloud GPUs. Let\'s get you set up in 60 seconds.' },
    { emoji: '🖥️', title: 'Choose Your GPU', desc: 'Browse our marketplace with GPUs from $0.30/hr. Pick RTX 4090s for speed or A100s for big models.' },
    { emoji: '🚀', title: 'Launch a Session', desc: 'Select a model, pick your GPU, and hit Pump. Your session spins up in under 30 seconds.' },
    { emoji: '🔑', title: 'API Access', desc: 'Use our OpenAI-compatible API with your sessions. Generate an API key from your dashboard.' },
    { emoji: '💰', title: 'Pay As You Go', desc: 'Add credits or subscribe. Free tier includes 60 minutes/day. Upgrade for more power.' },
    { emoji: '🎉', title: 'You\'re Ready!', desc: 'Head to the marketplace to browse GPUs, or jump straight to pumping your first session.' },
];

export default function OnboardingWizard({ onNavigate, user, onComplete }: Props) {
    const [step, setStep] = useState(0);
    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '420px', maxWidth: '90vw', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                {/* Progress */}
                <div style={{ display: 'flex', gap: '3px', padding: '1rem 1.5rem 0' }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= step ? '#00d4ff' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{current.emoji}</div>
                    <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                        {step === 0 && user?.name ? `${current.title}, ${user.name}!` : current.title}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>{current.desc}</p>
                </div>

                {/* Actions */}
                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                    {step > 0 && (
                        <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                            ← Back
                        </button>
                    )}
                    <button onClick={() => {
                        if (isLast) { localStorage.setItem('pumpme_onboarded', 'true'); onComplete(); }
                        else setStep(s => s + 1);
                    }} style={{ flex: 2, padding: '0.65rem', borderRadius: '10px', background: isLast ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' : '#00d4ff', border: 'none', color: isLast ? '#fff' : '#000', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        {isLast ? '🚀 Start Pumping' : 'Next →'}
                    </button>
                </div>

                {/* Skip */}
                <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                    <button onClick={() => { localStorage.setItem('pumpme_onboarded', 'true'); onComplete(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Skip tour
                    </button>
                </div>
            </div>
        </div>
    );
}
