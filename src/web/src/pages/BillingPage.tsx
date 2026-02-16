/**
 * Billing Page — credits, subscriptions, usage, transactions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './BillingPage.css';

interface Transaction {
    id: string;
    date: string;
    type: string;
    amount: number;
    description: string;
}

interface UsageStats {
    period: string;
    totalSessions: number;
    totalMinutes: number;
    totalCost: number;
}

const CREDIT_PACKAGES = [
    { id: 'credits_5', name: 'Starter Pack', amount: 5, price: '$5', bonus: '' },
    { id: 'credits_20', name: 'Builder Pack', amount: 20, price: '$20', bonus: '' },
    { id: 'credits_50', name: 'Power Pack', amount: 50, price: '$50', bonus: '+$5 free!' },
    { id: 'credits_100', name: 'Pro Pack', amount: 100, price: '$100', bonus: '+$15 free!' },
    { id: 'credits_500', name: 'Enterprise', amount: 500, price: '$500', bonus: '+$100 free!' },
];

interface Props {
    onNavigate: (page: string) => void;
}

export default function BillingPage({ onNavigate }: Props) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [txRes, usageRes] = await Promise.all([
                    api.get<{ invoices: Transaction[] }>('/billing/invoices'),
                    api.get<UsageStats>('/billing/usage'),
                ]);
                if (txRes.success && txRes.data) setTransactions(txRes.data.invoices || []);
                if (usageRes.success && usageRes.data) setUsage(usageRes.data);
            } catch { /* ignore */ }
            setLoading(false);
        }
        load();
    }, []);

    async function purchaseCredits(packageId: string) {
        setPurchasing(true);
        try {
            const res = await api.post<{ checkoutUrl: string }>('/payments/create-checkout-session', {
                tier: 'credits',
                packageId,
            });
            if (res.success && res.data?.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            }
        } catch { /* ignore */ }
        setPurchasing(false);
    }

    return (
        <div className="billing-page">
            <div className="billing-header">
                <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
                <h1>Billing & Credits</h1>
            </div>

            {/* Balance Card */}
            <div className="billing-balance-card">
                <div className="balance-left">
                    <h3>Credit Balance</h3>
                    <div className="balance-amount">${((user?.creditBalance || 0) / 100).toFixed(2)}</div>
                    <p className="balance-sub">{user?.tier === 'free' ? 'Free tier' : `${user?.tier} plan`}</p>
                </div>
                <div className="balance-right">
                    <button className="btn btn-primary" onClick={() => onNavigate('pricing')}>Upgrade Plan</button>
                </div>
            </div>

            {/* Credit Packages */}
            <section className="billing-section">
                <h2>Buy Credits</h2>
                <div className="credit-packages">
                    {CREDIT_PACKAGES.map(pkg => (
                        <button
                            key={pkg.id}
                            className="credit-card"
                            onClick={() => purchaseCredits(pkg.id)}
                            disabled={purchasing}
                        >
                            <div className="credit-amount">${pkg.amount}</div>
                            <div className="credit-name">{pkg.name}</div>
                            <div className="credit-price">{pkg.price}</div>
                            {pkg.bonus && <div className="credit-bonus">{pkg.bonus}</div>}
                        </button>
                    ))}
                </div>
            </section>

            {/* Usage Summary */}
            {usage && (
                <section className="billing-section">
                    <h2>Usage (Last 30 Days)</h2>
                    <div className="usage-grid">
                        <div className="usage-card">
                            <span className="usage-value">{usage.totalSessions}</span>
                            <span className="usage-label">Sessions</span>
                        </div>
                        <div className="usage-card">
                            <span className="usage-value">{usage.totalMinutes}</span>
                            <span className="usage-label">Minutes</span>
                        </div>
                        <div className="usage-card">
                            <span className="usage-value">${((usage.totalCost || 0) / 100).toFixed(2)}</span>
                            <span className="usage-label">Total Spent</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Transaction History */}
            <section className="billing-section">
                <h2>Transaction History</h2>
                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <p>No transactions yet. Start a session to see billing here.</p>
                    </div>
                ) : (
                    <div className="tx-table">
                        <div className="tx-header">
                            <span>Date</span>
                            <span>Description</span>
                            <span>Type</span>
                            <span>Amount</span>
                        </div>
                        {transactions.map(tx => (
                            <div key={tx.id} className="tx-row">
                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                                <span>{tx.description}</span>
                                <span className="tx-type">{tx.type.replace('_', ' ')}</span>
                                <span className={tx.amount >= 0 ? 'tx-positive' : 'tx-negative'}>
                                    {tx.amount >= 0 ? '+' : ''}${(Math.abs(tx.amount) / 100).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
