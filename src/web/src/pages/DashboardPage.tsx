/**
 * Dashboard Page — shows user stats, sessions, and quick actions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './AuthForms.css';

interface Session {
    id: string;
    tier: string;
    status: string;
    modelName: string | null;
    totalMinutes: number;
    totalCost: number;
    createdAt: string;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get<{ data: Session[]; pagination: unknown }>('/sessions');
                if (res.success && res.data) {
                    setSessions((res.data as unknown as { data: Session[] }).data || []);
                }
            } catch { /* ignore */ }
            setLoading(false);
        }
        load();
    }, []);

    const activeSessions = sessions.filter(s => ['active', 'ready', 'provisioning'].includes(s.status));
    const totalSpent = sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                        {user?.tier === 'free' ? 'Free tier' : `${user?.tier} plan`}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate('pump')}>
                    🚀 Start Pumping
                </button>
            </div>

            <div className="dashboard-grid">
                <div className="dash-card">
                    <h3>Credit Balance</h3>
                    <div className="value">${((user?.creditBalance || 0) / 100).toFixed(2)}</div>
                    <div className="sub">
                        <button onClick={() => onNavigate('pricing')} className="link-btn">Add Credits</button>
                    </div>
                </div>

                <div className="dash-card">
                    <h3>Active Sessions</h3>
                    <div className="value">{activeSessions.length}</div>
                    <div className="sub">{sessions.length} total sessions</div>
                </div>

                <div className="dash-card">
                    <h3>Total Spent</h3>
                    <div className="value">${(totalSpent / 100).toFixed(2)}</div>
                    <div className="sub">Lifetime usage</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <button className="dash-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate('pump')}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ fontWeight: 600 }}>Quick Pump</div>
                    <div className="sub">Start a burst session</div>
                </button>
                <button className="dash-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate('models')}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
                    <div style={{ fontWeight: 600 }}>Browse Models</div>
                    <div className="sub">50+ AI models ready</div>
                </button>
                <button className="dash-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate('pricing')}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                    <div style={{ fontWeight: 600 }}>Manage Plan</div>
                    <div className="sub">Upgrade or add credits</div>
                </button>
            </div>

            {/* Recent Sessions */}
            <div className="session-list">
                <h2>Recent Sessions</h2>
                {loading && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading sessions...</p>}
                {!loading && sessions.length === 0 && (
                    <div className="dash-card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</p>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No sessions yet</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>Start your first GPU session to see it here</p>
                        <button className="btn btn-primary" onClick={() => onNavigate('pump')}>Start First Session</button>
                    </div>
                )}
                {sessions.slice(0, 10).map(session => (
                    <div key={session.id} className="session-item">
                        <div className="session-info">
                            <span className="session-name">{session.modelName || session.tier} session</span>
                            <span className="session-meta">
                                {new Date(session.createdAt).toLocaleDateString()} · {session.totalMinutes || 0}min · ${((session.totalCost || 0) / 100).toFixed(2)}
                            </span>
                        </div>
                        <span className={`status-badge status-${session.status}`}>{session.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
