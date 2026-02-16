// Roadmap Page

interface Props { onNavigate: (page: string) => void; }

interface RoadmapItem { title: string; desc: string; status: 'shipped' | 'in-progress' | 'planned'; quarter: string; votes: number; }

const ITEMS: RoadmapItem[] = [
    { title: 'OpenAI-Compatible API', desc: 'Drop-in replacement for chat completions, embeddings', status: 'shipped', quarter: 'Q4 2025', votes: 342 },
    { title: 'Multi-Provider Failover', desc: 'Automatic failover across Vast.ai, RunPod, Lambda Labs', status: 'shipped', quarter: 'Q4 2025', votes: 289 },
    { title: 'H100 GPU Support', desc: '80GB HBM3 GPUs for fastest inference', status: 'shipped', quarter: 'Q1 2026', votes: 456 },
    { title: 'API Playground', desc: 'Interactive API testing with streaming', status: 'shipped', quarter: 'Q1 2026', votes: 198 },
    { title: 'Fine-Tuning API', desc: 'LoRA fine-tuning via API with dataset upload', status: 'in-progress', quarter: 'Q1 2026', votes: 523 },
    { title: 'Batch Inference', desc: 'Queue large batches at 50% discount', status: 'in-progress', quarter: 'Q1 2026', votes: 387 },
    { title: 'Image Generation API', desc: 'SDXL and Flux models via /v1/images/generate', status: 'in-progress', quarter: 'Q2 2026', votes: 412 },
    { title: 'Custom Model Upload', desc: 'Upload and serve your own fine-tuned models', status: 'planned', quarter: 'Q2 2026', votes: 634 },
    { title: 'Serverless Inference', desc: 'Scale-to-zero with cold start < 5s', status: 'planned', quarter: 'Q2 2026', votes: 567 },
    { title: 'Multi-Region (EU)', desc: 'European GPU endpoints for GDPR compliance', status: 'planned', quarter: 'Q3 2026', votes: 321 },
    { title: 'Embeddings API', desc: 'High-throughput embedding generation', status: 'planned', quarter: 'Q3 2026', votes: 298 },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    shipped: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: '✅ Shipped' },
    'in-progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '🔨 In Progress' },
    planned: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: '📋 Planned' },
};

export default function RoadmapPage({ onNavigate }: Props) {
    const groups = ['shipped', 'in-progress', 'planned'] as const;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('changelog')}>← Changelog</button>
            <h1 style={{ margin: '1rem 0' }}>🗺️ Product Roadmap</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                What we've built, what we're building, and what's coming next. Vote to influence priorities.
            </p>

            {groups.map(status => (
                <div key={status} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: STATUS_STYLES[status].color, marginBottom: '0.5rem' }}>
                        {STATUS_STYLES[status].label} ({ITEMS.filter(i => i.status === status).length})
                    </div>
                    {ITEMS.filter(i => i.status === status).map(item => (
                        <div key={item.title} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.title}</span>
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{item.quarter}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>{item.desc}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                <button style={{ padding: '0.15rem 0.3rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>▲</button>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '25px', textAlign: 'center' }}>{item.votes}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
