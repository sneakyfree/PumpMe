// Integrations Page

interface Props { onNavigate: (page: string) => void; }

interface Integration { name: string; category: string; desc: string; status: 'available' | 'beta' | 'coming-soon'; icon: string; }

const INTEGRATIONS: Integration[] = [
    { name: 'OpenAI SDK', category: 'SDK', desc: 'Drop-in compatible. Use any OpenAI client library.', status: 'available', icon: '🤖' },
    { name: 'LangChain', category: 'Framework', desc: 'Full support as custom LLM provider.', status: 'available', icon: '🔗' },
    { name: 'LlamaIndex', category: 'Framework', desc: 'Use PumpMe as inference backend for RAG.', status: 'available', icon: '🦙' },
    { name: 'Vercel AI SDK', category: 'Framework', desc: 'Stream AI responses in Next.js apps.', status: 'available', icon: '▲' },
    { name: 'Zapier', category: 'Automation', desc: 'Trigger GPU sessions from any Zapier workflow.', status: 'beta', icon: '⚡' },
    { name: 'GitHub Actions', category: 'CI/CD', desc: 'Run model evaluations in your CI pipeline.', status: 'available', icon: '🐙' },
    { name: 'Weights & Biases', category: 'MLOps', desc: 'Log training runs and model metrics.', status: 'beta', icon: '📊' },
    { name: 'Slack', category: 'Communication', desc: 'Get session alerts and cost reports in Slack.', status: 'available', icon: '💬' },
    { name: 'Discord Bot', category: 'Communication', desc: 'Interact with PumpMe models from Discord.', status: 'available', icon: '🎮' },
    { name: 'Terraform', category: 'IaC', desc: 'Manage GPU infrastructure as code.', status: 'coming-soon', icon: '🏗️' },
    { name: 'Kubernetes', category: 'IaC', desc: 'Custom operator for GPU pod scheduling.', status: 'coming-soon', icon: '☸️' },
    { name: 'Hugging Face', category: 'Model Hub', desc: 'One-click deploy any HF model.', status: 'available', icon: '🤗' },
];

const STATUS_COLORS: Record<string, { color: string; label: string }> = {
    available: { color: '#34d399', label: 'Available' },
    beta: { color: '#f59e0b', label: 'Beta' },
    'coming-soon': { color: '#64748b', label: 'Coming Soon' },
};

export default function IntegrationsPage({ onNavigate }: Props) {

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>🔌 Integrations</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Connect PumpMe to your existing tools and workflows.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {INTEGRATIONS.map(int => (
                    <div key={int.name} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{int.icon}</span>
                            <span style={{ padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 600, background: `${STATUS_COLORS[int.status].color}15`, color: STATUS_COLORS[int.status].color }}>{STATUS_COLORS[int.status].label}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.1rem' }}>{int.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{int.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
