import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface GuardrailRule { id: string; name: string; category: string; enabled: boolean; action: 'block' | 'warn' | 'log'; desc: string; }

const DEFAULT_RULES: GuardrailRule[] = [
    { id: 'g-001', name: 'PII Detection', category: 'Privacy', enabled: true, action: 'block', desc: 'Block requests containing SSNs, credit card numbers, or email addresses in prompts.' },
    { id: 'g-002', name: 'Harmful Content', category: 'Safety', enabled: true, action: 'block', desc: 'Use Llama Guard to detect and block harmful content categories.' },
    { id: 'g-003', name: 'Prompt Injection', category: 'Security', enabled: true, action: 'warn', desc: 'Detect jailbreak attempts and prompt injection attacks.' },
    { id: 'g-004', name: 'Topic Restriction', category: 'Compliance', enabled: false, action: 'block', desc: 'Block responses about specific topics (configurable blocklist).' },
    { id: 'g-005', name: 'Output Length Limit', category: 'Cost', enabled: true, action: 'block', desc: 'Cap generation at configured max_tokens to prevent cost overruns.' },
    { id: 'g-006', name: 'Rate Anomaly', category: 'Security', enabled: true, action: 'log', desc: 'Log unusual spikes in request volume for manual review.' },
    { id: 'g-007', name: 'Code Execution Block', category: 'Safety', enabled: false, action: 'warn', desc: 'Warn when model generates executable code patterns.' },
    { id: 'g-008', name: 'Language Filter', category: 'Compliance', enabled: false, action: 'block', desc: 'Restrict responses to specified languages only.' },
];

const ACTION_STYLES: Record<string, { color: string; bg: string }> = {
    block: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    warn: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    log: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export default function GuardrailsPage({ onNavigate }: Props) {
    const [rules, setRules] = useState(DEFAULT_RULES);

    const toggle = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('security')}>← Security</button>
            <h1 style={{ margin: '1rem 0' }}>🚧 Guardrails</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Configure safety, privacy, and compliance rules for your inference requests.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Rules', value: rules.filter(r => r.enabled).length, color: '#34d399' },
                    { label: 'Blocking', value: rules.filter(r => r.enabled && r.action === 'block').length, color: '#ef4444' },
                    { label: 'Monitoring', value: rules.filter(r => r.enabled && r.action !== 'block').length, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {rules.map(rule => (
                <div key={rule.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', opacity: rule.enabled ? 1 : 0.5 }}>
                    <div style={{ marginTop: '0.1rem', cursor: 'pointer' }} onClick={() => toggle(rule.id)}>
                        <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: rule.enabled ? '#34d399' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: rule.enabled ? '16px' : '2px', transition: 'left 0.2s' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.1rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rule.name}</span>
                            <span style={{ padding: '0.05rem 0.25rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: ACTION_STYLES[rule.action].bg, color: ACTION_STYLES[rule.action].color }}>{rule.action}</span>
                            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>{rule.category}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{rule.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
