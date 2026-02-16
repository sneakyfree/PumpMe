import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Alert { id: string; name: string; metric: string; threshold: string; channel: string; enabled: boolean; triggered: boolean; }

const DEFAULT_ALERTS: Alert[] = [
    { id: 'ua-1', name: 'Daily spend limit', metric: 'daily_cost', threshold: '$50.00', channel: 'Email + Slack', enabled: true, triggered: false },
    { id: 'ua-2', name: 'Monthly budget warning', metric: 'monthly_cost', threshold: '$500 (80%)', channel: 'Email', enabled: true, triggered: true },
    { id: 'ua-3', name: 'High error rate', metric: 'error_rate', threshold: '> 5%', channel: 'Slack + PagerDuty', enabled: true, triggered: false },
    { id: 'ua-4', name: 'Token usage spike', metric: 'tokens_per_hour', threshold: '> 500K/hr', channel: 'Slack', enabled: true, triggered: false },
    { id: 'ua-5', name: 'Rate limit approaching', metric: 'rate_limit_usage', threshold: '> 90%', channel: 'Email', enabled: false, triggered: false },
    { id: 'ua-6', name: 'Latency degradation', metric: 'p99_latency', threshold: '> 5000ms', channel: 'PagerDuty', enabled: true, triggered: false },
];

export default function UsageAlertsPage({ onNavigate }: Props) {
    const [alerts, setAlerts] = useState(DEFAULT_ALERTS);

    const toggle = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('analytics')}>← Analytics</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>🔔 Usage Alerts</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ New Alert</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Alerts', value: alerts.filter(a => a.enabled).length, color: '#00d4ff' },
                    { label: 'Triggered', value: alerts.filter(a => a.triggered).length, color: '#ef4444' },
                    { label: 'Channels', value: '3', color: '#34d399' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {alerts.map(alert => (
                <div key={alert.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${alert.triggered ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', opacity: alert.enabled ? 1 : 0.5 }}>
                    <div style={{ cursor: 'pointer' }} onClick={() => toggle(alert.id)}>
                        <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: alert.enabled ? '#34d399' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: alert.enabled ? '16px' : '2px', transition: 'left 0.2s' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.name}</span>
                            {alert.triggered && <span style={{ fontSize: '0.55rem', padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>TRIGGERED</span>}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                            {alert.threshold} · via {alert.channel}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
