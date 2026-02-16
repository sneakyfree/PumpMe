/**
 * Onboarding Tour — First-time user experience walkthrough
 *
 * Shows a step-by-step tour when user first logs in, explaining key features.
 * Stores completion state in localStorage.
 */

import { useState, useEffect } from 'react';

interface TourStep {
    title: string;
    description: string;
    icon: string;
    action?: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        title: 'Welcome to Pump Me! 🚀',
        description: 'The most normie-friendly GPU compute platform. Get access to beast-mode GPUs in seconds.',
        icon: '👋',
    },
    {
        title: 'Start a Session',
        description: 'Click "Start Pumping" to fire up a GPU. Pick your tier, choose a model, and go.',
        icon: '⚡',
        action: 'pump',
    },
    {
        title: 'Browse Models',
        description: '50+ AI models from Meta, Google, Mistral, and more. Pre-loaded and ready to run.',
        icon: '🧠',
        action: 'models',
    },
    {
        title: 'VRAM Calculator',
        description: 'Not sure what GPU you need? Our calculator tells you exactly what fits your model.',
        icon: '🔢',
        action: 'vram',
    },
    {
        title: '5 Minutes Free',
        description: 'Your first session is on us — 5 minutes of Beast mode (8x H100). No credit card required.',
        icon: '🎁',
    },
    {
        title: 'API Access',
        description: 'Drop-in replacement for OpenAI API. Use your existing code with our GPUs.',
        icon: '🔌',
        action: 'docs',
    },
];

interface Props {
    onNavigate: (page: string) => void;
    onComplete: () => void;
}

export default function OnboardingTour({ onNavigate, onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('pumpme_tour_completed');
        if (!completed) {
            setVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('pumpme_tour_completed', 'true');
        setVisible(false);
        onComplete();
    };

    const handleAction = () => {
        const action = TOUR_STEPS[step].action;
        if (action) {
            handleComplete();
            onNavigate(action);
        }
    };

    if (!visible) return null;

    const current = TOUR_STEPS[step];

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            backdropFilter: 'blur(6px)',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(20,20,40,0.98), rgba(10,10,25,0.98))',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                maxWidth: '440px',
                width: '90%',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{current.icon}</div>
                <h2 style={{ marginBottom: '0.5rem' }}>{current.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {current.description}
                </p>

                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {TOUR_STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: i === step
                                ? 'linear-gradient(90deg, #00d4ff, #7c3aed)'
                                : i < step ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s',
                        }} />
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {current.action && (
                        <button className="btn btn-secondary" onClick={handleAction}>
                            Try It →
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleNext}>
                        {step < TOUR_STEPS.length - 1 ? 'Next' : '🚀 Let\'s Go!'}
                    </button>
                </div>

                <button
                    onClick={handleComplete}
                    style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                        cursor: 'pointer', marginTop: '1rem', fontSize: '0.8rem',
                    }}
                >
                    Skip Tour
                </button>
            </div>
        </div>
    );
}
