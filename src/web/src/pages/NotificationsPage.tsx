import { useState } from 'react';

interface Notification { id: string; type: 'info' | 'success' | 'warning' | 'error'; title: string; message: string; time: string; read: boolean; }
interface Props { onNavigate: (page: string) => void; }

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'success', title: 'Session Completed', message: 'Your Llama 3.1 70B session ran for 2h 14m. Total cost: $2.47', time: '5 minutes ago', read: false },
    { id: '2', type: 'info', title: 'New GPU Available', message: 'H100 80GB GPUs are now available on RunPod at $2.69/hr', time: '1 hour ago', read: false },
    { id: '3', type: 'warning', title: 'Credit Balance Low', message: 'Your balance is $3.50. Add credits to avoid session interruptions.', time: '3 hours ago', read: false },
    { id: '4', type: 'success', title: 'Payment Received', message: '$50.00 credit package added to your account', time: '1 day ago', read: true },
    { id: '5', type: 'info', title: 'New Model Available', message: 'Llama 3.2 Vision is now supported. Try it in the marketplace!', time: '2 days ago', read: true },
    { id: '6', type: 'error', title: 'Session Failed', message: 'Provider error on Vast.ai. Automatic failover to RunPod completed.', time: '3 days ago', read: true },
    { id: '7', type: 'info', title: 'Weekly Summary', message: 'You used 8 sessions, 14.5 hours of GPU time, and saved $12.30 vs. on-demand pricing.', time: '5 days ago', read: true },
    { id: '8', type: 'success', title: 'Team Member Joined', message: 'alice@company.com accepted your team invitation.', time: '1 week ago', read: true },
];

export default function NotificationsPage({ onNavigate }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

    const typeStyles: Record<string, { icon: string; color: string }> = {
        info: { icon: 'ℹ️', color: '#00d4ff' },
        success: { icon: '✅', color: '#34d399' },
        warning: { icon: '⚠️', color: '#f59e0b' },
        error: { icon: '❌', color: '#ef4444' },
    };

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>🔔 Notifications {unreadCount > 0 && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '10px', background: '#ef4444', color: '#fff', verticalAlign: 'middle' }}>{unreadCount}</span>}</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'unread'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'capitalize',
                            background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                        }}>{f}</button>
                    ))}
                    {unreadCount > 0 && <button onClick={markAllRead} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>Mark all read</button>}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    {filter === 'unread' ? 'No unread notifications 🎉' : 'No notifications yet'}
                </div>
            ) : filtered.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{
                    display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '10px', cursor: 'pointer',
                    background: n.read ? 'rgba(255,255,255,0.01)' : 'rgba(0,212,255,0.02)',
                    border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,255,0.1)'}`,
                }}>
                    <div style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>{typeStyles[n.type].icon}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.85rem' }}>{n.title}</div>
                            <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>{n.time}</div>
                    </div>
                    {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff', marginTop: '0.4rem', flexShrink: 0 }} />}
                </div>
            ))}
        </div>
    );
}
