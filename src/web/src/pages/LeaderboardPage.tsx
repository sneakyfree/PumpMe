/**
 * Leaderboard Page — community pump rankings
 *
 * FEAT-128: Pump Leaderboard with gamification
 */

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
    rank: number;
    name: string;
    tier: string;
    sessionsCompleted: number;
    totalMinutes: number;
    badge: { name: string; emoji: string };
}

interface MyRank {
    rank: number;
    sessionsCompleted: number;
    totalMinutes: number;
    badge: { name: string; emoji: string };
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function LeaderboardPage({ onNavigate }: Props) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<MyRank | null>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [boardRes, meRes] = await Promise.all([
                fetch(`/api/leaderboard?period=${period}&limit=25`),
                fetch('/api/leaderboard/me', { credentials: 'include' }),
            ]);
            if (boardRes.ok) {
                const data = await boardRes.json();
                setEntries(data.data?.leaderboard || []);
            }
            if (meRes.ok) {
                const data = await meRes.json();
                setMyRank(data.data);
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const TIER_COLORS: Record<string, string> = {
        free: '#94a3b8', starter: '#34d399', pro: '#00d4ff', beast: '#a855f7', ultra: '#f59e0b',
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🏆</span> Pump Leaderboard
            </h1>

            {/* Period Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['week', 'month', 'all'] as const).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                            background: period === p ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${period === p ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            color: period === p ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
                    </button>
                ))}
            </div>

            {/* My Rank Card */}
            {myRank && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
                    border: '1px solid rgba(0,212,255,0.15)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem',
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>YOUR RANK</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{myRank.badge.emoji}</span>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>#{myRank.rank}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                {myRank.badge.name} · {myRank.sessionsCompleted} sessions · {Math.floor(myRank.totalMinutes / 60)}h pumped
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {!loading && entries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                    <p>No pump sessions yet. Be the first to claim the top spot!</p>
                </div>
            )}

            {!loading && entries.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {entries.map(entry => (
                        <div key={entry.rank} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                            background: entry.rank <= 3
                                ? `linear-gradient(135deg, ${entry.rank === 1 ? 'rgba(245,158,11,0.08)' : entry.rank === 2 ? 'rgba(148,163,184,0.08)' : 'rgba(205,127,50,0.08)'}, transparent)`
                                : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${entry.rank <= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)'}`,
                            borderRadius: '10px',
                        }}>
                            <div style={{
                                width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
                                color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.3)',
                            }}>
                                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>
                                    {entry.name}
                                    <span style={{
                                        marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                        background: `${TIER_COLORS[entry.tier] || '#94a3b8'}15`,
                                        color: TIER_COLORS[entry.tier] || '#94a3b8',
                                    }}>{entry.tier}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                    {entry.badge.emoji} {entry.badge.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, color: '#00d4ff' }}>{Math.floor(entry.totalMinutes / 60)}h</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{entry.sessionsCompleted} sessions</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
