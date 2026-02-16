import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const LOGS = [
    { id: 'req-1', method: 'POST', path: '/v1/chat/completions', status: 200, latency: '142ms', size: '2.4 KB', timestamp: '09:04:32', ip: '172.16.0.1' },
    { id: 'req-2', method: 'POST', path: '/v1/chat/completions', status: 200, latency: '891ms', size: '8.1 KB', timestamp: '09:04:28', ip: '172.16.0.1' },
    { id: 'req-3', method: 'POST', path: '/v1/embeddings', status: 200, latency: '45ms', size: '1.2 KB', timestamp: '09:04:15', ip: '10.0.0.5' },
    { id: 'req-4', method: 'GET', path: '/v1/models', status: 200, latency: '12ms', size: '3.8 KB', timestamp: '09:03:58', ip: '172.16.0.1' },
    { id: 'req-5', method: 'POST', path: '/v1/chat/completions', status: 429, latency: '3ms', size: '0.2 KB', timestamp: '09:03:42', ip: '198.51.100.99' },
    { id: 'req-6', method: 'POST', path: '/v1/fine-tuning/jobs', status: 201, latency: '234ms', size: '0.8 KB', timestamp: '09:03:10', ip: '172.16.0.2' },
    { id: 'req-7', method: 'DELETE', path: '/v1/api-keys/pk-old', status: 204, latency: '67ms', size: '0 KB', timestamp: '09:02:45', ip: '172.16.0.1' },
    { id: 'req-8', method: 'POST', path: '/v1/chat/completions', status: 500, latency: '2100ms', size: '0.3 KB', timestamp: '09:02:12', ip: '10.0.0.5' },
];

const METHOD_COLORS: Record<string, string> = { GET: '#34d399', POST: '#00d4ff', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#7c3aed' };

export default function ApiRequestLogsPage({ onNavigate }: Props) {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? LOGS : LOGS.filter(l => {
        if (filter === '2xx') return l.status >= 200 && l.status < 300;
        if (filter === '4xx') return l.status >= 400 && l.status < 500;
        if (filter === '5xx') return l.status >= 500;
        return true;
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('api-usage')}>← API Usage</button>
            <h1 style={{ margin: '1rem 0' }}>📡 API Request Logs</h1>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {['all', '2xx', '4xx', '5xx'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{f}</button>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Time', 'Method', 'Path', 'Status', 'Latency', 'Size', 'IP'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '0.4rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.4rem' }}><code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{log.timestamp}</code></td>
                                <td style={{ padding: '0.4rem' }}><span style={{ fontWeight: 700, color: METHOD_COLORS[log.method] }}>{log.method}</span></td>
                                <td style={{ padding: '0.4rem' }}><code style={{ fontSize: '0.7rem' }}>{log.path}</code></td>
                                <td style={{ padding: '0.4rem', fontWeight: 700, color: log.status < 300 ? '#34d399' : log.status < 500 ? '#f59e0b' : '#ef4444' }}>{log.status}</td>
                                <td style={{ padding: '0.4rem', color: parseInt(log.latency) > 1000 ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>{log.latency}</td>
                                <td style={{ padding: '0.4rem', color: 'rgba(255,255,255,0.3)' }}>{log.size}</td>
                                <td style={{ padding: '0.4rem' }}><code style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{log.ip}</code></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
