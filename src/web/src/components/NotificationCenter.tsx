/**
 * Notification Center — in-app notification bell + dropdown
 *
 * FEAT-051: Notification UI component
 */

import { useState, useEffect, useCallback } from 'react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                fetch('/api/notifications?limit=10', { credentials: 'include' }),
                fetch('/api/notifications/unread', { credentials: 'include' }),
            ]);
            if (notifRes.ok) {
                const data = await notifRes.json();
                setNotifications(data.data?.notifications || []);
            }
            if (countRes.ok) {
                const data = await countRes.json();
                setUnreadCount(data.data?.count || 0);
            }
        } catch { /* silent */ }
    }, []);

    // Poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id: string) => {
        await fetch(`/api/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const typeIcon: Record<string, string> = {
        session_started: '🚀', session_ended: '✅', session_failed: '❌',
        credit_low: '⚠️', payment_received: '💵', subscription_renewed: '🔄',
        subscription_expiring: '⏰', quota_warning: '📊', system: '🔔', referral_credit: '🎉',
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative',
                    fontSize: '1.25rem', padding: '0.25rem 0.5rem',
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                        borderRadius: '50%', width: '16px', height: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, width: '360px',
                    background: 'rgba(15,15,25,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', overflow: 'hidden', zIndex: 100,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{
                                background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.75rem',
                            }}>Mark all read</button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                No notifications yet
                            </div>
                        ) : notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => { if (!n.read) markRead(n.id); }}
                                style={{
                                    display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    background: n.read ? 'transparent' : 'rgba(0,212,255,0.03)',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                                        {n.title}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', lineHeight: 1.3 }}>
                                        {n.message}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', marginTop: '0.25rem' }}>
                                        {timeAgo(n.createdAt)}
                                    </div>
                                </div>
                                {!n.read && (
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff',
                                        flexShrink: 0, marginTop: '0.3rem',
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
