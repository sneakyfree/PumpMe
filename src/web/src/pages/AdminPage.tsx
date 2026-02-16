/**
 * Admin Dashboard Page — platform management interface
 *
 * FEAT-141: Admin dashboard with stats, users, sessions, audit logs
 */

import { useState, useEffect } from 'react';
import './SessionHistory.css';

interface PlatformStats {
    totalUsers: number;
    activeUsers24h: number;
    activeSessions: number;
    totalRevenue: number;
    totalSessions: number;
    avgSessionMinutes: number;
}

interface AdminUser {
    id: string;
    email: string;
    name: string;
    tier: string;
    status: string;
    creditBalance: number;
    createdAt: string;
    lastLoginAt?: string;
}

interface AuditEntry {
    id: string;
    userId?: string;
    action: string;
    resource?: string;
    createdAt: string;
}

type AdminTab = 'overview' | 'users' | 'sessions' | 'audit';

export default function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [tab, setTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'overview' || !stats) {
                const res = await fetch('/api/admin/stats', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.data);
                }
            }
            if (tab === 'users') {
                const res = await fetch('/api/admin/users?limit=50', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.data?.users || []);
                }
            }
            if (tab === 'audit') {
                const res = await fetch('/api/admin/audit?limit=50', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setAuditLogs(data.data?.logs || []);
                }
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const suspendUser = async (userId: string) => {
        if (!confirm('Suspend this user? Their sessions will be terminated.')) return;
        try {
            await fetch(`/api/admin/users/${userId}/suspend`, {
                method: 'POST',
                credentials: 'include',
            });
            loadData();
        } catch { /* silent */ }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="session-history">
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>

            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🛡️</span> Admin Panel
            </h1>

            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem' }}>
                {(['overview', 'users', 'sessions', 'audit'] as AdminTab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: tab === t ? 'rgba(0,212,255,0.15)' : 'transparent',
                            border: `1px solid ${tab === t ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            color: tab === t ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            borderRadius: t === 'overview' ? '6px 0 0 6px' : t === 'audit' ? '0 6px 6px 0' : '0',
                            borderLeft: t !== 'overview' ? 'none' : undefined,
                        }}
                    >
                        {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : t === 'sessions' ? '⚡ Sessions' : '📋 Audit'}
                    </button>
                ))}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {!loading && tab === 'overview' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: '👥', color: '#00d4ff' },
                        { label: 'Active (24h)', value: stats.activeUsers24h.toLocaleString(), icon: '🟢', color: '#34d399' },
                        { label: 'Live Sessions', value: stats.activeSessions.toLocaleString(), icon: '⚡', color: '#fbbf24' },
                        { label: 'Total Revenue', value: `$${(stats.totalRevenue / 100).toLocaleString()}`, icon: '💰', color: '#7c3aed' },
                        { label: 'Total Sessions', value: stats.totalSessions.toLocaleString(), icon: '🚀', color: '#00d4ff' },
                        { label: 'Avg Duration', value: `${stats.avgSessionMinutes.toFixed(0)}m`, icon: '⏱️', color: '#34d399' },
                    ].map((stat, i) => (
                        <div key={i} className="session-card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && tab === 'users' && (
                <div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search users by name or email..."
                        style={{
                            width: '100%', padding: '0.65rem 1rem', marginBottom: '1rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', color: '#fff', fontSize: '0.9rem',
                        }}
                    />
                    {filteredUsers.map(user => (
                        <div key={user.id} className="session-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{user.email}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                    background: user.tier === 'admin' ? 'rgba(239,68,68,0.15)' : user.tier === 'beast' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: user.tier === 'admin' ? '#ef4444' : user.tier === 'beast' ? '#7c3aed' : 'rgba(255,255,255,0.5)',
                                }}>{user.tier || 'free'}</span>
                                <span style={{ color: '#00d4ff', fontSize: '0.85rem' }}>${(user.creditBalance / 100).toFixed(2)}</span>
                                {user.status !== 'suspended' && user.tier !== 'admin' && (
                                    <button onClick={() => suspendUser(user.id)} style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                        color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                                    }}>Suspend</button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>No users found</div>}
                </div>
            )}

            {!loading && tab === 'sessions' && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ fontSize: '2rem' }}>⚡</span>
                    <p>Live session monitoring coming soon.</p>
                    <p style={{ fontSize: '0.8rem' }}>Use Grafana dashboard for real-time metrics.</p>
                </div>
            )}

            {!loading && tab === 'audit' && (
                <div>
                    {auditLogs.map(log => (
                        <div key={log.id} className="session-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0.75rem 1rem' }}>
                            <div>
                                <span style={{
                                    fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.15rem 0.4rem', borderRadius: '3px',
                                    background: log.action.includes('admin') ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,255,0.1)',
                                    color: log.action.includes('admin') ? '#ef4444' : '#00d4ff',
                                }}>{log.action}</span>
                                {log.resource && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{log.resource}</span>}
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {auditLogs.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>No audit logs yet</div>}
                </div>
            )}
        </div>
    );
}
