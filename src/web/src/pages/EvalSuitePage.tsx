import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const EVALS = [
    { id: 'ev-1', name: 'Customer Support Quality', model: 'llama-3.1-70b', dataset: '500 conversations', score: 87.4, baseline: 82.1, status: 'completed' as const, date: '1 day ago' },
    { id: 'ev-2', name: 'Code Generation Accuracy', model: 'codellama-34b', dataset: '200 challenges', score: 92.1, baseline: 88.5, status: 'completed' as const, date: '2 days ago' },
    { id: 'ev-3', name: 'Summarization ROUGE-L', model: 'mistral-7b', dataset: '300 articles', score: 0, baseline: 71.2, status: 'running' as const, date: '10 min ago' },
    { id: 'ev-4', name: 'Toxicity Filter', model: 'llama-3.1-70b', dataset: '1000 prompts', score: 99.2, baseline: 97.8, status: 'completed' as const, date: '3 days ago' },
    { id: 'ev-5', name: 'RAG Retrieval Accuracy', model: 'llama-3.1-405b', dataset: '150 queries', score: 78.9, baseline: 74.3, status: 'completed' as const, date: '1 week ago' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    completed: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    running: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function EvalSuitePage({ onNavigate }: Props) {
    const [evals] = useState(EVALS);

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('benchmarks')}>← Benchmarks</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>📊 Evaluation Suite</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ New Eval</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Evals', value: evals.length, color: '#00d4ff' },
                    { label: 'Avg Score', value: `${(evals.filter(e => e.score > 0).reduce((s, e) => s + e.score, 0) / evals.filter(e => e.score > 0).length).toFixed(1)}%`, color: '#34d399' },
                    { label: 'Running', value: evals.filter(e => e.status === 'running').length, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {evals.map(ev => (
                <div key={ev.id} style={{ padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.name}</span>
                            <span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STATUS_STYLES[ev.status].bg, color: STATUS_STYLES[ev.status].color }}>{ev.status}</span>
                        </div>
                        {ev.score > 0 && (
                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: ev.score > ev.baseline ? '#34d399' : '#ef4444' }}>{ev.score}%</span>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>baseline: {ev.baseline}%</span>
                                <span style={{ fontSize: '0.6rem', color: ev.score > ev.baseline ? '#34d399' : '#ef4444' }}>({ev.score > ev.baseline ? '+' : ''}{(ev.score - ev.baseline).toFixed(1)})</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                        <span>{ev.model}</span>
                        <span>{ev.dataset}</span>
                        <span>{ev.date}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
