// Deployment Logs Page

interface Props { onNavigate: (page: string) => void; }

const DEPLOYMENTS = [
    { id: 'dep-12', model: 'llama-3.1-70b-ft-acme', version: 'v3', status: 'active' as const, region: 'us-east-1', replicas: 4, created: '2 hours ago', gpu: 'A100 80GB', latency: '145ms' },
    { id: 'dep-11', model: 'codellama-34b-ft-internal', version: 'v2', status: 'active' as const, region: 'eu-west-1', replicas: 2, created: '1 day ago', gpu: 'A100 40GB', latency: '210ms' },
    { id: 'dep-10', model: 'llama-3.1-70b-ft-acme', version: 'v2', status: 'replaced' as const, region: 'us-east-1', replicas: 0, created: '3 days ago', gpu: 'A100 80GB', latency: '—' },
    { id: 'dep-09', model: 'mistral-7b-ft-support', version: 'v1', status: 'active' as const, region: 'us-west-2', replicas: 1, created: '1 week ago', gpu: 'L40S', latency: '89ms' },
    { id: 'dep-08', model: 'llama-3.1-70b-ft-acme', version: 'v1', status: 'terminated' as const, region: 'us-east-1', replicas: 0, created: '2 weeks ago', gpu: 'A100 80GB', latency: '—' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    active: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    replaced: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    terminated: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export default function DeploymentLogsPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('custom-models')}>← Custom Models</button>
            <h1 style={{ margin: '1rem 0' }}>🚀 Deployment Logs</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Deployments', value: DEPLOYMENTS.filter(d => d.status === 'active').length, color: '#34d399' },
                    { label: 'Total Replicas', value: DEPLOYMENTS.reduce((s, d) => s + d.replicas, 0), color: '#00d4ff' },
                    { label: 'Avg Latency', value: '148ms', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {DEPLOYMENTS.map(dep => (
                <div key={dep.id} style={{ padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dep.model}</span>
                            <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{dep.version}</span>
                        </div>
                        <span style={{ padding: '0.05rem 0.25rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 600, background: STATUS_STYLES[dep.status].bg, color: STATUS_STYLES[dep.status].color }}>{dep.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                        <span>📍 {dep.region}</span>
                        <span>🖥 {dep.gpu}</span>
                        <span>×{dep.replicas} replicas</span>
                        <span>⚡ {dep.latency}</span>
                        <span>{dep.created}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
