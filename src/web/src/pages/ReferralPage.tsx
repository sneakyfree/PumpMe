/**
 * Referral Dashboard — referral stats and share tools
 *
 * FEAT-130: Referral dashboard with share links
 */

import { useState, useEffect } from 'react';

interface ReferralData {
    referralCode: string;
    referralUrl: string;
    totalReferred: number;
    qualifiedReferrals: number;
    totalEarned: number;
    referredUsers: { name: string; tier: string; joinedAt: string }[];
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function ReferralPage({ onNavigate }: Props) {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await fetch('/api/referrals', { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const copyLink = () => {
        if (data) {
            navigator.clipboard.writeText(data.referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const claimRewards = async () => {
        setClaiming(true);
        try {
            await fetch('/api/referrals/claim', { method: 'POST', credentials: 'include' });
            await loadData();
        } catch { /* silent */ }
        setClaiming(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🎁</span> Referral Program
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Earn <strong style={{ color: '#34d399' }}>$5.00</strong> in credits for every friend who pumps their first session.
            </p>

            {data && (
                <>
                    {/* Share Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
                        border: '1px solid rgba(0,212,255,0.15)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>YOUR REFERRAL LINK</div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <code style={{
                                flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                                fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all',
                            }}>{data.referralUrl}</code>
                            <button onClick={copyLink} style={{
                                padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                                background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(0,212,255,0.1)',
                                border: '1px solid rgba(0,212,255,0.2)', color: copied ? '#34d399' : '#00d4ff', fontSize: '0.8rem',
                            }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                            Code: <strong style={{ color: '#00d4ff' }}>{data.referralCode}</strong>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '1rem', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data.totalReferred}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Total Referred</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '1rem', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>{data.qualifiedReferrals}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Qualified</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '1rem', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>${(data.totalEarned / 100).toFixed(2)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Earned</div>
                        </div>
                    </div>

                    {/* Claim Button */}
                    {data.qualifiedReferrals > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={claimRewards}
                            disabled={claiming}
                            style={{ width: '100%', marginBottom: '1.5rem' }}
                        >
                            {claiming ? '⏳ Claiming...' : `💰 Claim $${(data.qualifiedReferrals * 5).toFixed(2)} in Rewards`}
                        </button>
                    )}

                    {/* Referred Users List */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '0.75rem 1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                            Referred Users ({data.referredUsers.length})
                        </div>
                        {data.referredUsers.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                Share your link to start earning!
                            </div>
                        ) : data.referredUsers.map((u, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{u.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                                        Joined {new Date(u.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                    background: u.tier === 'free' ? 'rgba(148,163,184,0.1)' : 'rgba(0,212,255,0.1)',
                                    color: u.tier === 'free' ? '#94a3b8' : '#00d4ff',
                                }}>{u.tier}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
