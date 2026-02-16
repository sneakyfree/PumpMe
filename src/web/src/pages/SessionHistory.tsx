/**
 * Session History Page — view past sessions with duration, cost, and model details
 */

import { useState, useEffect } from 'react';
import api from '../lib/api';
import './SessionHistory.css';

interface Session {
    id: string;
    type: string;
    tier: string;
    gpuType: string;
    modelName: string | null;
    status: string;
    totalMinutes: number;
    totalCost: number;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    provider: string;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function SessionHistory({ onNavigate }: Props) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'terminated'>('all');

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get<{ data: Session[] }>('/sessions');
                if (res.success && res.data) {
                    setSessions((res.data as unknown as { data: Session[] }).data || []);
                }
            } catch { /* ignore */ }
            setLoading(false);
        }
        load();
    }, []);

    const filtered = sessions.filter(s => {
        if (filter === 'active') return ['active', 'ready', 'provisioning'].includes(s.status);
        if (filter === 'terminated') return s.status === 'terminated';
        return true;
    });

    function statusBadge(status: string) {
        const colors: Record<string, string> = {
            active: '#34c759',
            ready: '#00d4ff',
            provisioning: '#ffd60a',
            paused: '#ff9500',
            terminated: 'rgba(255,255,255,0.3)',
            error: '#ff3b30',
            pending: 'rgba(255,255,255,0.4)',
        };
        return (
            <span className="status-badge" style={{ background: `${colors[status] || '#666'}20`, color: colors[status] || '#666' }}>
                {status}
            </span>
        );
    }

    return (
        <div className="session-history">
            <div className="sh-header">
                <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
                <h1>Session History</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>{sessions.length} total sessions</p>
            </div>

            {/* Filter tabs */}
            <div className="sh-filters">
                {(['all', 'active', 'terminated'] as const).map(f => (
                    <button
                        key={f}
                        className={`sh-filter ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="filter-count">
                            {f === 'all' ? sessions.length : sessions.filter(s =>
                                f === 'active' ? ['active', 'ready', 'provisioning'].includes(s.status) : s.status === 'terminated'
                            ).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Sessions list */}
            {loading ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '3rem' }}>Loading sessions...</p>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <p>{filter === 'all' ? 'No sessions yet.' : `No ${filter} sessions.`}</p>
                    <button className="btn btn-primary" onClick={() => onNavigate('pump')}>Launch a Session →</button>
                </div>
            ) : (
                <div className="sh-list">
                    {filtered.map(session => (
                        <div key={session.id} className="sh-card">
                            <div className="sh-card-top">
                                <div className="sh-card-info">
                                    <h3>{session.modelName || 'GPU Session'}</h3>
                                    <p className="sh-meta">
                                        {session.gpuType} · {session.tier} · {session.provider}
                                    </p>
                                </div>
                                {statusBadge(session.status)}
                            </div>
                            <div className="sh-card-stats">
                                <div>
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">{session.totalMinutes}m</span>
                                </div>
                                <div>
                                    <span className="stat-label">Cost</span>
                                    <span className="stat-value">${(session.totalCost / 100).toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="stat-label">Started</span>
                                    <span className="stat-value">
                                        {session.startedAt ? new Date(session.startedAt).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
