import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface BatchJob { id: string; name: string; model: string; status: 'queued' | 'running' | 'completed' | 'failed'; progress: number; totalRequests: number; completedRequests: number; createdAt: string; cost: string; }

const MOCK_JOBS: BatchJob[] = [
    { id: 'batch-001', name: 'Dataset Classification', model: 'Llama 3.1 70B', status: 'running', progress: 67, totalRequests: 5000, completedRequests: 3350, createdAt: '2 hours ago', cost: '$4.20' },
    { id: 'batch-002', name: 'Code Review Batch', model: 'CodeLlama 34B', status: 'completed', progress: 100, totalRequests: 1200, completedRequests: 1200, createdAt: '1 day ago', cost: '$1.80' },
    { id: 'batch-003', name: 'Translation Pipeline', model: 'Mistral 7B', status: 'queued', progress: 0, totalRequests: 8000, completedRequests: 0, createdAt: '10 min ago', cost: '$0.00' },
    { id: 'batch-004', name: 'Sentiment Analysis', model: 'Llama 3.1 70B', status: 'failed', progress: 42, totalRequests: 3000, completedRequests: 1260, createdAt: '3 days ago', cost: '$2.10' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    queued: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    running: { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    completed: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function BatchJobsPage({ onNavigate }: Props) {
    const [jobs] = useState(MOCK_JOBS);

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>📦 Batch Jobs</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ New Batch</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Jobs', value: jobs.length, color: '#00d4ff' },
                    { label: 'Running', value: jobs.filter(j => j.status === 'running').length, color: '#f59e0b' },
                    { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: '#34d399' },
                    { label: 'Total Cost', value: `$${jobs.reduce((s, j) => s + parseFloat(j.cost.replace('$', '')), 0).toFixed(2)}`, color: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {jobs.map(job => (
                <div key={job.id} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.35rem' }}>
                        <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.5rem' }}>{job.model}</span>
                        </div>
                        <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', background: STATUS_STYLES[job.status].bg, color: STATUS_STYLES[job.status].color }}>{job.status}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                        <div style={{ width: `${job.progress}%`, height: '100%', background: STATUS_STYLES[job.status].color, borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                        <span>{job.completedRequests.toLocaleString()} / {job.totalRequests.toLocaleString()} requests ({job.progress}%)</span>
                        <span>{job.cost} · {job.createdAt}</span>
                    </div>
                </div>
            ))}

            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                💡 Batch jobs run at 50% discount on standard pricing. Results are available via webhook or download.
            </div>
        </div>
    );
}
