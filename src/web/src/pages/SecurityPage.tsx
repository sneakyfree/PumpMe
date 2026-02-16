import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function SecurityPage({ onNavigate }: Props) {
    const [twoFa, setTwoFa] = useState(false);
    const [showSessions, setShowSessions] = useState(false);

    const activeSessions = [
        { id: '1', device: 'Chrome on Linux', ip: '192.168.1.100', location: 'New York, US', lastActive: 'Just now', current: true },
        { id: '2', device: 'Firefox on macOS', ip: '10.0.0.42', location: 'San Francisco, US', lastActive: '2 hours ago', current: false },
        { id: '3', device: 'Mobile Safari', ip: '172.16.0.5', location: 'London, UK', lastActive: '1 day ago', current: false },
    ];

    const securityLog = [
        { action: 'Login successful', device: 'Chrome on Linux', time: '2 minutes ago' },
        { action: 'API key created', device: 'Chrome on Linux', time: '1 hour ago' },
        { action: 'Password changed', device: 'Firefox on macOS', time: '3 days ago' },
        { action: 'Login from new device', device: 'Mobile Safari', time: '5 days ago' },
        { action: '2FA enabled', device: 'Chrome on Linux', time: '1 week ago' },
    ];

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0' }}>🔒 Security</h1>

            {/* 2FA */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🛡️ Two-Factor Authentication</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Adds an extra layer of security to your account</div>
                    </div>
                    <button onClick={() => setTwoFa(!twoFa)} style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
                        background: twoFa ? '#34d399' : 'rgba(255,255,255,0.1)',
                    }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: twoFa ? '23px' : '3px', transition: 'left 0.2s' }} />
                    </button>
                </div>
                {twoFa && <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '8px', fontSize: '0.8rem', color: '#34d399' }}>✅ 2FA is enabled via authenticator app</div>}
            </div>

            {/* Password */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🔑 Password</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Last changed 3 days ago</div>
                    </div>
                    <button className="btn" onClick={() => onNavigate('settings')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>Change</button>
                </div>
            </div>

            {/* Active Sessions */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showSessions ? '0.75rem' : 0 }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📱 Active Sessions</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{activeSessions.length} devices logged in</div>
                    </div>
                    <button className="btn" onClick={() => setShowSessions(!showSessions)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>{showSessions ? 'Hide' : 'Show'}</button>
                </div>
                {showSessions && activeSessions.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.current ? '#34d399' : 'rgba(255,255,255,0.15)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem' }}>{s.device} {s.current && <span style={{ fontSize: '0.6rem', color: '#34d399' }}>(current)</span>}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.ip} · {s.location} · {s.lastActive}</div>
                        </div>
                        {!s.current && <button style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Revoke</button>}
                    </div>
                ))}
            </div>

            {/* Security Log */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📋 Security Log</div>
                {securityLog.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: '0.8rem' }}>
                        <span>{l.action} <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>· {l.device}</span></span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{l.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
