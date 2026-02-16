// Cost Breakdown Page

interface Props { onNavigate: (page: string) => void; }

interface CostItem { category: string; amount: number; percent: number; color: string; details: string; }

const COSTS: CostItem[] = [
    { category: 'Inference (Chat)', amount: 34.50, percent: 52, color: '#00d4ff', details: '1.2M prompt + 890K completion tokens' },
    { category: 'Inference (Batch)', amount: 12.80, percent: 19, color: '#7c3aed', details: '3 batch jobs, 14K total requests' },
    { category: 'Fine-Tuning', amount: 8.40, percent: 13, color: '#f59e0b', details: '2 training runs, 4.2 GPU-hours' },
    { category: 'Embeddings', amount: 4.20, percent: 6, color: '#34d399', details: '210M tokens embedded' },
    { category: 'Storage', amount: 3.50, percent: 5, color: '#ec4899', details: '2 model adapters, 384MB' },
    { category: 'Image Gen', amount: 2.80, percent: 4, color: '#f97316', details: '140 images generated' },
    { category: 'Webhooks', amount: 0.50, percent: 1, color: '#64748b', details: '12K deliveries' },
];

export default function CostBreakdownPage({ onNavigate }: Props) {
    const total = COSTS.reduce((s, c) => s + c.amount, 0);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('billing')}>← Billing</button>
            <h1 style={{ margin: '1rem 0' }}>💰 Cost Breakdown</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Current billing period · Feb 1–28, 2026</p>

            {/* Total */}
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00d4ff' }}>${total.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Total spend this period</div>
            </div>

            {/* Stacked bar */}
            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                {COSTS.map(c => (
                    <div key={c.category} style={{ width: `${c.percent}%`, background: c.color, transition: 'width 0.3s' }} title={`${c.category}: $${c.amount.toFixed(2)}`} />
                ))}
            </div>

            {/* Detail rows */}
            {COSTS.map(c => (
                <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.category}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{c.details}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${c.amount.toFixed(2)}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{c.percent}%</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
