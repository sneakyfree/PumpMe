import { useState } from 'react';
import './PricingPage.css';

interface PricingTier {
    id: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    cta: string;
}

const PRICING_TIERS: PricingTier[] = [
    {
        id: 'burst',
        name: 'Pump Burst',
        price: 0.59,
        period: '/hour',
        description: 'Pay per minute, no commitment',
        features: [
            'RTX 4090 starting tier',
            'Pay only for what you use',
            '50+ pre-loaded models',
            'Instant session start',
            'Basic support',
        ],
        cta: 'Start Free Trial',
    },
    {
        id: 'vpn',
        name: 'Pump VPN',
        price: 49,
        period: '/month',
        description: 'Persistent virtual lab',
        features: [
            'Everything in Burst',
            '10 hours included monthly',
            'Saved environments',
            'Custom model uploads',
            'Priority GPU access',
            'Priority support',
        ],
        highlighted: true,
        cta: 'Start VPN Trial',
    },
    {
        id: 'home',
        name: 'Pump Home',
        price: 149,
        period: '/month',
        description: 'Storage + hosting + inference',
        features: [
            'Everything in VPN',
            '30 hours included monthly',
            '100GB persistent storage',
            'Inference API endpoint',
            'Webhook integrations',
            'White-label ready',
            'Dedicated support',
        ],
        cta: 'Contact Sales',
    },
];

interface PricingPageProps {
    onBack?: () => void;
}

export default function PricingPage({ onBack }: PricingPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSubscribe = async (tierId: string) => {
        if (tierId === 'home') {
            window.location.href = 'mailto:sales@pumpme.io?subject=Pump%20Home%20Inquiry';
            return;
        }
        if (tierId === 'burst') {
            // Free trial flow
            alert('Starting your 5-minute Beast Mode trial...');
            return;
        }

        setIsLoading(true);
        setLoadingTier(tierId);

        try {
            const response = await fetch('/api/payments/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier_id: tierId,
                    success_url: window.location.origin + '/?subscription=success',
                    cancel_url: window.location.origin + '/pricing',
                }),
            });

            const data = await response.json();
            if (data.checkout_url) window.location.href = data.checkout_url;
        } catch {
            alert('Unable to connect to payment service.');
        } finally {
            setIsLoading(false);
            setLoadingTier(null);
        }
    };

    return (
        <div className="pricing-page">
            <div className="pricing-container">
                {onBack && (
                    <button className="pricing-back" onClick={onBack}>← Back</button>
                )}
                <header className="pricing-header">
                    <h1>Simple, Per-Minute Pricing</h1>
                    <p>No hour blocks. No anxiety. Pay for what you use.</p>
                </header>

                <div className="pricing-grid">
                    {PRICING_TIERS.map(tier => (
                        <div key={tier.id} className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}>
                            {tier.highlighted && <div className="pricing-popular">Most Popular</div>}
                            <div className="pricing-tier-header">
                                <h2>{tier.name}</h2>
                                <p>{tier.description}</p>
                            </div>
                            <div className="pricing-price">
                                <span className="pricing-currency">$</span>
                                <span className="pricing-amount">{tier.price}</span>
                                <span className="pricing-period">{tier.period}</span>
                            </div>
                            <ul className="pricing-features">
                                {tier.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                            </ul>
                            <button
                                className={`pricing-btn ${tier.highlighted ? 'primary' : 'secondary'}`}
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={isLoading && loadingTier === tier.id}
                            >
                                {isLoading && loadingTier === tier.id ? '...' : tier.cta}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="pricing-note">5 minutes of Beast Mode free. All prices in USD. Cancel anytime.</p>
            </div>
        </div>
    );
}
