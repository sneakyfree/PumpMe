/**
 * Credit Purchase Modal — buy prepaid GPU compute credits
 *
 * FEAT-036: Prepaid credits purchase flow
 */

import { useState } from 'react';

interface Props {
    currentBalance: number; // cents
    onClose: () => void;
    onPurchase: (packageId: string) => void;
}

const CREDIT_PACKAGES = [
    { id: 'credits_10', name: 'Starter Pack', credits: 1000, price: 1000, popular: false, bonus: '' },
    { id: 'credits_25', name: 'Builder Pack', credits: 2750, price: 2500, popular: true, bonus: '+10% bonus' },
    { id: 'credits_50', name: 'Power Pack', credits: 6000, price: 5000, popular: false, bonus: '+20% bonus' },
    { id: 'credits_100', name: 'Enterprise Pack', credits: 13000, price: 10000, popular: false, bonus: '+30% bonus' },
];

export default function CreditPurchaseModal({ currentBalance, onClose, onPurchase }: Props) {
    const [selectedPkg, setSelectedPkg] = useState('credits_25');
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            onPurchase(selectedPkg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(20,20,35,0.98), rgba(10,10,20,0.98))',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '480px',
                width: '90%',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>⚡ Add Credits</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Current Balance</span>
                    <span style={{ fontWeight: 700, color: '#00d4ff', fontSize: '1.1rem' }}>${(currentBalance / 100).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {CREDIT_PACKAGES.map(pkg => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPkg(pkg.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.25rem',
                                background: selectedPkg === pkg.id
                                    ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))'
                                    : 'rgba(255,255,255,0.03)',
                                border: selectedPkg === pkg.id
                                    ? '2px solid rgba(0,212,255,0.4)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                            }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{pkg.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                    ${(pkg.credits / 100).toFixed(0)} in credits
                                    {pkg.bonus && <span style={{ color: '#34d399', marginLeft: '0.5rem' }}>{pkg.bonus}</span>}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${(pkg.price / 100).toFixed(0)}</div>
                            {pkg.popular && (
                                <div style={{
                                    position: 'absolute', top: '-8px', right: '12px',
                                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                    padding: '2px 8px', borderRadius: '4px',
                                }}>MOST POPULAR</div>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handlePurchase}
                    disabled={loading}
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                >
                    {loading ? '⏳ Processing...' : `💳 Purchase — $${(CREDIT_PACKAGES.find(p => p.id === selectedPkg)!.price / 100).toFixed(0)}`}
                </button>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: '1rem' }}>
                    Powered by Stripe · Secure checkout · Instant delivery
                </p>
            </div>
        </div>
    );
}
