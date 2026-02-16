/**
 * Subscription Management Page — view, manage, cancel subscriptions
 *
 * FEAT-085: Subscription management UI
 */

import { useState, useEffect } from 'react';

interface SubscriptionPlan {
    id: string;
    name: string;
    monthlyPrice: number;
    includedMinutes: number;
    description: string;
}

interface CurrentSubscription {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    includedMinutes: number;
    usedMinutes: number;
    cancelAtPeriodEnd: boolean;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function SubscriptionPage({ onNavigate }: Props) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [current, setCurrent] = useState<CurrentSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [plansRes, currentRes] = await Promise.all([
                fetch('/api/subscriptions/plans'),
                fetch('/api/subscriptions/current', { credentials: 'include' }),
            ]);
            if (plansRes.ok) {
                const data = await plansRes.json();
                setPlans(data.data || []);
            }
            if (currentRes.ok) {
                const data = await currentRes.json();
                setCurrent(data.data);
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleSubscribe = async (planId: string) => {
        setActionLoading(planId);
        try {
            const res = await fetch('/api/subscriptions/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ planId }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data?.checkoutUrl) {
                    window.location.href = data.data.checkoutUrl;
                }
            }
        } catch { /* silent */ }
        setActionLoading('');
    };

    const handleCancel = async () => {
        if (!confirm('Cancel your subscription? It will remain active until the end of the billing period.')) return;
        setActionLoading('cancel');
        try {
            await fetch('/api/subscriptions/cancel', { method: 'POST', credentials: 'include' });
            await loadData();
        } catch { /* silent */ }
        setActionLoading('');
    };

    const handleReactivate = async () => {
        setActionLoading('reactivate');
        try {
            await fetch('/api/subscriptions/reactivate', { method: 'POST', credentials: 'include' });
            await loadData();
        } catch { /* silent */ }
        setActionLoading('');
    };

    const PLAN_COLORS: Record<string, string> = {
        burst: '#34d399',
        vpn: '#00d4ff',
        home: '#7c3aed',
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('billing')}>← Billing</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Subscription</h1>

            {/* Current subscription */}
            {current && (
                <div style={{
                    background: `linear-gradient(135deg, ${PLAN_COLORS[current.plan] || '#00d4ff'}15, ${PLAN_COLORS[current.plan] || '#00d4ff'}08)`,
                    border: `1px solid ${PLAN_COLORS[current.plan] || '#00d4ff'}30`,
                    borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.25rem', color: PLAN_COLORS[current.plan] || '#00d4ff' }}>
                                {plans.find(p => p.id === current.plan)?.name || current.plan}
                            </h3>
                            <span style={{
                                fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                                background: current.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                                color: current.status === 'active' ? '#34d399' : '#fbbf24',
                            }}>
                                {current.cancelAtPeriodEnd ? '⚠️ Canceling' : `✅ ${current.status}`}
                            </span>
                        </div>
                        {current.cancelAtPeriodEnd ? (
                            <button className="btn btn-primary" onClick={handleReactivate} disabled={actionLoading === 'reactivate'} style={{ fontSize: '0.85rem' }}>
                                {actionLoading === 'reactivate' ? '...' : '♻️ Reactivate'}
                            </button>
                        ) : (
                            <button onClick={handleCancel} disabled={actionLoading === 'cancel'} style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                            }}>
                                {actionLoading === 'cancel' ? '...' : 'Cancel'}
                            </button>
                        )}
                    </div>

                    {/* Usage bar */}
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {current.usedMinutes}m / {current.includedMinutes}m used
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Renews {new Date(current.currentPeriodEnd).toLocaleDateString()}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                            <div style={{
                                width: `${Math.min((current.usedMinutes / current.includedMinutes) * 100, 100)}%`,
                                height: '100%', borderRadius: '3px',
                                background: `linear-gradient(90deg, ${PLAN_COLORS[current.plan] || '#00d4ff'}, ${PLAN_COLORS[current.plan] || '#00d4ff'}80)`,
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Available plans */}
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                {current ? 'Change Plan' : 'Choose a Plan'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {plans.filter(p => p.monthlyPrice > 0).map(plan => {
                    const isCurrent = current?.plan === plan.id;
                    return (
                        <div key={plan.id} style={{
                            padding: '1.5rem', textAlign: 'center',
                            background: isCurrent ? `${PLAN_COLORS[plan.id]}0d` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isCurrent ? PLAN_COLORS[plan.id] + '40' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '16px',
                        }}>
                            <h3 style={{ color: PLAN_COLORS[plan.id] || '#fff', marginBottom: '0.25rem' }}>{plan.name}</h3>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                ${(plan.monthlyPrice / 100).toFixed(0)}<span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>/mo</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                {Math.floor(plan.includedMinutes / 60)} hrs included
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '1rem' }}>{plan.description}</p>
                            {isCurrent ? (
                                <span style={{ color: PLAN_COLORS[plan.id], fontWeight: 600, fontSize: '0.85rem' }}>Current Plan</span>
                            ) : (
                                <button className="btn btn-primary" onClick={() => handleSubscribe(plan.id)} disabled={!!actionLoading} style={{ width: '100%' }}>
                                    {actionLoading === plan.id ? '⏳...' : 'Subscribe'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
