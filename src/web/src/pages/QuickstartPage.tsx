import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const STEPS = [
    {
        title: '1. Create Your Account',
        desc: 'Sign up with email or Google OAuth. Free tier gives you 60 minutes/day.',
        code: null,
        action: { label: 'Sign Up', page: 'register' },
    },
    {
        title: '2. Browse the GPU Marketplace',
        desc: 'Compare GPUs from Vast.ai, RunPod, and Lambda Labs. Filter by price, VRAM, or performance.',
        code: null,
        action: { label: 'View GPUs', page: 'marketplace' },
    },
    {
        title: '3. Launch a Session (Web)',
        desc: 'Pick a model, select your GPU, and click Pump. Your session is ready in ~30 seconds.',
        code: null,
        action: { label: 'Start Pumping', page: 'pump' },
    },
    {
        title: '4. Launch via API',
        desc: 'Use our OpenAI-compatible API endpoint. Drop-in replacement for any OpenAI SDK.',
        code: `import openai

client = openai.OpenAI(
    base_url="https://api.pumpme.io/v1",
    api_key="pm-your-api-key"
)

response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-70B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`,
        action: { label: 'Get API Key', page: 'api-keys' },
    },
    {
        title: '5. Monitor & Manage',
        desc: 'Track usage, costs, and performance from your dashboard. Set up webhooks for real-time events.',
        code: `curl -H "Authorization: Bearer pm-your-api-key" \\
  https://api.pumpme.io/api/api-usage`,
        action: { label: 'View Dashboard', page: 'dashboard' },
    },
];

export default function QuickstartPage({ onNavigate }: Props) {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>⚡ Quickstart Guide</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Get from zero to running AI models in under 5 minutes.
            </p>

            {STEPS.map((step, i) => (
                <div key={i} onClick={() => setActiveStep(i)} style={{
                    marginBottom: '0.5rem', borderRadius: '12px', cursor: 'pointer',
                    background: activeStep === i ? 'rgba(0,212,255,0.03)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeStep === i ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: activeStep >= i ? '#00d4ff' : 'rgba(255,255,255,0.05)', color: activeStep >= i ? '#000' : 'rgba(255,255,255,0.3)',
                            fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                        }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{step.title.slice(3)}</div>
                            {activeStep !== i && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{step.desc.slice(0, 60)}...</div>}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>{activeStep === i ? '▲' : '▼'}</span>
                    </div>

                    {activeStep === i && (
                        <div style={{ padding: '0 1rem 1rem', paddingLeft: '3.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{step.desc}</p>
                            {step.code && (
                                <pre style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', lineHeight: 1.4, overflow: 'auto', marginBottom: '0.75rem', color: '#e2e8f0' }}>
                                    {step.code}
                                </pre>
                            )}
                            <button className="btn btn-primary" onClick={e => { e.stopPropagation(); onNavigate(step.action.page); }} style={{ fontSize: '0.8rem' }}>
                                {step.action.label} →
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
