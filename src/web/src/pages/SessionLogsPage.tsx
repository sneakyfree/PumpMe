import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface LogEntry { timestamp: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string; source: string; }

const MOCK_LOGS: LogEntry[] = [
    { timestamp: '2026-02-09T12:45:32Z', level: 'info', message: 'Session started on Vast.ai A100 80GB', source: 'orchestrator' },
    { timestamp: '2026-02-09T12:45:33Z', level: 'info', message: 'Container image pulled: vllm/vllm-openai:latest', source: 'provisioner' },
    { timestamp: '2026-02-09T12:45:35Z', level: 'info', message: 'Model loading: meta-llama/Llama-3.1-70B-Instruct', source: 'runtime' },
    { timestamp: '2026-02-09T12:45:48Z', level: 'info', message: 'Model loaded in 13.2s — VRAM usage: 68.4GB / 80GB', source: 'runtime' },
    { timestamp: '2026-02-09T12:45:49Z', level: 'debug', message: 'Health check passed — inference endpoint ready', source: 'monitor' },
    { timestamp: '2026-02-09T12:45:49Z', level: 'info', message: 'Session RUNNING — endpoint: https://pump-a1b2c3.pumpme.io', source: 'orchestrator' },
    { timestamp: '2026-02-09T12:50:12Z', level: 'info', message: 'Request served: 128 input tokens → 256 output tokens (1.8s)', source: 'inference' },
    { timestamp: '2026-02-09T12:55:30Z', level: 'warn', message: 'GPU temperature: 82°C — approaching thermal limit', source: 'monitor' },
    { timestamp: '2026-02-09T12:56:01Z', level: 'info', message: 'GPU temperature normalized: 74°C', source: 'monitor' },
    { timestamp: '2026-02-09T13:10:00Z', level: 'info', message: 'Request served: 512 input tokens → 1024 output tokens (4.2s)', source: 'inference' },
    { timestamp: '2026-02-09T14:30:00Z', level: 'warn', message: 'Credit balance low: $3.50 remaining', source: 'billing' },
    { timestamp: '2026-02-09T14:45:32Z', level: 'info', message: 'Session terminated by user — total runtime: 2h 0m', source: 'orchestrator' },
    { timestamp: '2026-02-09T14:45:33Z', level: 'info', message: 'Final cost: $2.20 (120 minutes × $1.10/hr)', source: 'billing' },
    { timestamp: '2026-02-09T14:45:34Z', level: 'debug', message: 'Container cleanup completed', source: 'provisioner' },
];

export default function SessionLogsPage({ onNavigate }: Props) {
    const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);

    const filtered = logs.filter(l => {
        if (filter !== 'all' && l.level !== filter) return false;
        if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const LEVEL_COLORS: Record<string, string> = { info: '#34d399', warn: '#f59e0b', error: '#ef4444', debug: '#64748b' };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('history')}>← Session History</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Session Logs</h1>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter logs..." style={{ flex: 1, minWidth: '150px', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }} />
                {['all', 'info', 'warn', 'error', 'debug'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase',
                        background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    }}>{f}</button>
                ))}
                <button onClick={() => setAutoScroll(!autoScroll)} style={{
                    padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                    background: autoScroll ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                    color: autoScroll ? '#34d399' : 'rgba(255,255,255,0.4)',
                }}>{autoScroll ? '⬇ Auto' : '⏸ Paused'}</button>
            </div>

            {/* Log entries */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.5rem', maxHeight: '500px', overflow: 'auto', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {filtered.map((l, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0.4rem', borderRadius: '3px', background: l.level === 'error' ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                        <span style={{ color: LEVEL_COLORS[l.level], fontWeight: 600, width: '40px', flexShrink: 0, textTransform: 'uppercase' }}>{l.level}</span>
                        <span style={{ color: 'rgba(0,212,255,0.5)', width: '80px', flexShrink: 0 }}>[{l.source}]</span>
                        <span style={{ color: l.level === 'error' ? '#fca5a5' : 'rgba(255,255,255,0.6)' }}>{l.message}</span>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem', textAlign: 'right' }}>{filtered.length} of {logs.length} entries shown</div>
        </div>
    );
}
