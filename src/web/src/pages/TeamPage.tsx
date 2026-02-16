import { useState, useEffect } from 'react';

interface Team { id: string; name: string; slug: string; myRole: string; memberCount: number; plan: string; createdAt: string; }
interface TeamDetail { id: string; name: string; slug: string; plan: string; members: { userId: string; role: string; user: { id: string; name: string; email: string; tier: string } }[]; }
interface Props { onNavigate: (page: string) => void; }

export default function TeamPage({ onNavigate }: Props) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null);
    const [myRole, setMyRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { loadTeams(); }, []);

    const loadTeams = async () => {
        try {
            const res = await fetch('/api/teams', { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setTeams(d.data?.teams || []); }
        } catch { /* */ }
        setLoading(false);
    };

    const createTeam = async () => {
        if (!newName.trim()) return;
        setCreating(true); setError('');
        try {
            const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: newName }) });
            if (res.ok) { setShowCreate(false); setNewName(''); await loadTeams(); }
            else { const d = await res.json(); setError(d.error?.message || 'Failed'); }
        } catch { setError('Network error'); }
        setCreating(false);
    };

    const loadTeamDetail = async (id: string) => {
        try {
            const res = await fetch(`/api/teams/${id}`, { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setSelectedTeam(d.data.team); setMyRole(d.data.myRole); }
        } catch { /* */ }
    };

    const inviteMember = async () => {
        if (!inviteEmail.trim() || !selectedTeam) return;
        setError('');
        try {
            const res = await fetch(`/api/teams/${selectedTeam.id}/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: inviteEmail }) });
            if (res.ok) { setInviteEmail(''); await loadTeamDetail(selectedTeam.id); }
            else { const d = await res.json(); setError(d.error?.message || 'Failed'); }
        } catch { setError('Network error'); }
    };

    const removeMember = async (memberId: string) => {
        if (!selectedTeam) return;
        await fetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, { method: 'DELETE', credentials: 'include' });
        await loadTeamDetail(selectedTeam.id);
    };

    const ROLE_COLORS: Record<string, string> = { owner: '#f59e0b', admin: '#a855f7', member: '#94a3b8' };

    if (selectedTeam) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button className="link-btn" onClick={() => setSelectedTeam(null)}>← My Teams</button>
                <h1 style={{ margin: '1rem 0' }}>👥 {selectedTeam.name}</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>/{selectedTeam.slug} · {selectedTeam.plan} plan</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

                {/* Invite */}
                {['owner', 'admin'].includes(myRole) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input type="email" placeholder="Email to invite" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
                        <button className="btn btn-primary" onClick={inviteMember} disabled={!inviteEmail.trim()}>Invite</button>
                    </div>
                )}

                {/* Members */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                        Members ({selectedTeam.members.length})
                    </div>
                    {selectedTeam.members.map(m => (
                        <div key={m.userId} style={{ display: 'flex', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                {(m.user.name || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{m.user.name || m.user.email}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{m.user.email}</div>
                            </div>
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', color: ROLE_COLORS[m.role] || '#94a3b8', background: `${ROLE_COLORS[m.role] || '#94a3b8'}15` }}>{m.role}</span>
                            {['owner', 'admin'].includes(myRole) && m.role !== 'owner' && (
                                <button onClick={() => removeMember(m.userId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>👥 My Teams</h1>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

            <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)} style={{ marginBottom: '1.5rem' }}>
                {showCreate ? '✕ Cancel' : '+ Create Team'}
            </button>

            {showCreate && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <input type="text" placeholder="Team name" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
                    <button className="btn btn-primary" onClick={createTeam} disabled={creating || !newName.trim()}>
                        {creating ? '⏳...' : '🚀 Create'}
                    </button>
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}
            {!loading && teams.length === 0 && !showCreate && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <p>No teams yet. Create one to collaborate!</p>
                </div>
            )}
            {teams.map(t => (
                <div key={t.id} onClick={() => loadTeamDetail(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👥</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{t.memberCount} members · {t.plan}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', color: ROLE_COLORS[t.myRole] || '#94a3b8', background: `${ROLE_COLORS[t.myRole] || '#94a3b8'}15` }}>{t.myRole}</span>
                </div>
            ))}
        </div>
    );
}
