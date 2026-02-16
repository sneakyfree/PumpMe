import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function OrgSettingsPage({ onNavigate }: Props) {
    const [orgName, setOrgName] = useState('Acme Corp');
    const [domain, setDomain] = useState('acme.com');
    const [sso, setSso] = useState(false);
    const [ipWhitelist, setIpWhitelist] = useState('');

    const members = [
        { email: 'john@acme.com', role: 'Owner', joined: 'Jan 2025' },
        { email: 'sarah@acme.com', role: 'Admin', joined: 'Mar 2025' },
        { email: 'dev-team@acme.com', role: 'Developer', joined: 'Jun 2025' },
        { email: 'billing@acme.com', role: 'Billing', joined: 'Sep 2025' },
    ];

    const ROLE_COLORS: Record<string, string> = { Owner: '#f59e0b', Admin: '#ef4444', Developer: '#00d4ff', Billing: '#34d399' };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0' }}>🏢 Organization Settings</h1>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>General</div>
                <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Organization Name</label>
                    <input value={orgName} onChange={e => setOrgName(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Verified Domain</label>
                    <input value={domain} onChange={e => setDomain(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Members ({members.length})</div>
                    <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>+ Invite</button>
                </div>
                {members.map(m => (
                    <div key={m.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                        <span>{m.email}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{m.joined}</span>
                            <span style={{ padding: '0.05rem 0.25rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 600, color: ROLE_COLORS[m.role] }}>{m.role}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Security</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>SAML SSO</span>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Require single sign-on for all members</div>
                    </div>
                    <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: sso ? '#34d399' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative' }} onClick={() => setSso(!sso)}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: sso ? '18px' : '2px', transition: 'left 0.2s' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>IP Allowlist (CIDR)</label>
                    <input value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="e.g. 10.0.0.0/8, 172.16.0.0/12" style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>Save Organization Settings</button>
        </div>
    );
}
