import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface LogEntry { id: string; model: string; promptTokens: number; completionTokens: number; latency: number; status: 'success' | 'error' | 'timeout'; timestamp: string; cost: string; cached: boolean; }

const MOCK_LOGS: LogEntry[] = [
    { id: 'inf-001', model: 'llama-3.1-70b', promptTokens: 245, completionTokens: 512, latency: 1240, status: 'success', timestamp: '1 min ago', cost: '$0.0038', cached: false },
    { id: 'inf-002', model: 'mistral-7b', promptTokens: 128, completionTokens: 256, latency: 340, status: 'success', timestamp: '3 min ago', cost: '$0.0008', cached: true },
    { id: 'inf-003', model: 'llama-3.1-405b', promptTokens: 1024, completionTokens: 0, latency: 30000, status: 'timeout', timestamp: '5 min ago', cost: '$0.0000', cached: false },
    { id: 'inf-004', model: 'codellama-34b', promptTokens: 890, completionTokens: 1420, latency: 2100, status: 'success', timestamp: '8 min ago', cost: '$0.0069', cached: false },
    { id: 'inf-005', model: 'llama-3.1-70b', promptTokens: 67, completionTokens: 189, latency: 890, status: 'success', timestamp: '12 min ago', cost: '$0.0013', cached: false },
    { id: 'inf-006', model: 'e5-mistral-7b', promptTokens: 2048, completionTokens: 0, latency: 45, status: 'success', timestamp: '15 min ago', cost: '$0.0001', cached: false },
    { id: 'inf-007', model: 'llama-3.1-70b', promptTokens: 512, completionTokens: 0, latency: 0, status: 'error', timestamp: '20 min ago', cost: '$0.0000', cached: false },
    { id: 'inf-008', model: 'mistral-7b', promptTokens: 340, completionTokens: 890, latency: 620, status: 'success', timestamp: '25 min ago', cost: '$0.0024', cached: true },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    success: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    error: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    timeout: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

export default function InferenceLogsPage({ onNavigate }: Props) {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? MOCK_LOGS : MOCK_LOGS.filter(l => l.status === filter);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('session-logs')}>← Session Logs</button>
            <h1 style={{ margin: '1rem 0' }}>📜 Inference Logs</h1>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {['all', 'success', 'error', 'timeout'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{f}</button>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Model', 'Prompt', 'Completion', 'Latency', 'Cost', 'Status', 'Time'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '0.4rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.7rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.4rem', fontWeight: 600 }}>{log.model}{log.cached && <span style={{ marginLeft: '0.2rem', fontSize: '0.55rem', color: '#7c3aed' }}>⚡</span>}</td>
                                <td style={{ padding: '0.4rem', color: 'rgba(255,255,255,0.4)' }}>{log.promptTokens.toLocaleString()}</td>
                                <td style={{ padding: '0.4rem', color: 'rgba(255,255,255,0.4)' }}>{log.completionTokens.toLocaleString()}</td>
                                <td style={{ padding: '0.4rem', color: log.latency > 5000 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>{log.latency}ms</td>
                                <td style={{ padding: '0.4rem', color: '#34d399' }}>{log.cost}</td>
                                <td style={{ padding: '0.4rem' }}><span style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 600, background: STATUS_STYLES[log.status].bg, color: STATUS_STYLES[log.status].color }}>{log.status}</span></td>
                                <td style={{ padding: '0.4rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.5rem' }}>⚡ = Cache hit · Showing last 100 requests</div>
        </div>
    );
}
