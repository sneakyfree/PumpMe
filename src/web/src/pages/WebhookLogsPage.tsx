import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface WebhookLog { id: string; event: string; url: string; status: number; duration: number; timestamp: string; requestBody: string; }

const MOCK_LOGS: WebhookLog[] = [
    { id: 'wh-001', event: 'session.completed', url: 'https://api.myapp.com/hooks/pumpme', status: 200, duration: 145, timestamp: '2 min ago', requestBody: '{"session_id":"sess-abc","model":"llama-3.1-70b","duration":3600,"cost":2.49}' },
    { id: 'wh-002', event: 'session.started', url: 'https://api.myapp.com/hooks/pumpme', status: 200, duration: 89, timestamp: '15 min ago', requestBody: '{"session_id":"sess-def","model":"mistral-7b","gpu":"a100-80"}' },
    { id: 'wh-003', event: 'billing.invoice.paid', url: 'https://billing.myapp.com/webhooks', status: 200, duration: 234, timestamp: '1 hour ago', requestBody: '{"invoice_id":"inv-123","amount":49.99,"currency":"usd"}' },
    { id: 'wh-004', event: 'session.failed', url: 'https://api.myapp.com/hooks/pumpme', status: 500, duration: 3012, timestamp: '3 hours ago', requestBody: '{"session_id":"sess-ghi","error":"GPU OOM","model":"llama-3.1-405b"}' },
    { id: 'wh-005', event: 'api_key.created', url: 'https://api.myapp.com/hooks/pumpme', status: 200, duration: 67, timestamp: '1 day ago', requestBody: '{"key_id":"key-xyz","name":"Production Key","scopes":["inference"]}' },
    { id: 'wh-006', event: 'session.completed', url: 'https://api.myapp.com/hooks/pumpme', status: 408, duration: 30000, timestamp: '2 days ago', requestBody: '{"session_id":"sess-jkl","model":"codellama-34b","duration":1800}' },
];

export default function WebhookLogsPage({ onNavigate }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('webhooks')}>← Webhooks</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Webhook Delivery Logs</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Total Deliveries', value: MOCK_LOGS.length, color: '#00d4ff' },
                    { label: 'Success Rate', value: `${Math.round(MOCK_LOGS.filter(l => l.status < 400).length / MOCK_LOGS.length * 100)}%`, color: '#34d399' },
                    { label: 'Avg Latency', value: `${Math.round(MOCK_LOGS.reduce((s, l) => s + l.duration, 0) / MOCK_LOGS.length)}ms`, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {MOCK_LOGS.map(log => (
                <div key={log.id} style={{ marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <code style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 700, background: log.status < 400 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: log.status < 400 ? '#34d399' : '#ef4444' }}>{log.status}</code>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{log.event}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                            <span>{log.duration}ms</span>
                            <span>{log.timestamp}</span>
                        </div>
                    </div>
                    {expanded === log.id && (
                        <div style={{ padding: '0 0.75rem 0.5rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>→ {log.url}</div>
                            <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: '#e2e8f0', overflow: 'auto' }}>{JSON.stringify(JSON.parse(log.requestBody), null, 2)}</pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
