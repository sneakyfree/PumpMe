/**
 * PumpMe Pricing Configuration
 *
 * Single source of truth for all tier definitions, GPU tiers, 
 * credit packages, and subscription tiers.
 * 
 * Imported by routes, services, and frontend (via API).
 */

// ── GPU Compute Tiers ──────────────────────────────────────────────────────

export const GPU_TIERS = {
    starter: {
        name: 'Starter',
        description: 'Perfect for trying AI models and light inference',
        gpuOptions: ['RTX 4090', 'RTX 5090'],
        vramGb: 24,
        pricePerMinute: 0.01, // ~$0.60/hr
        recommendedFor: 'Chat, code completion, small image generation',
    },
    pro: {
        name: 'Pro',
        description: 'For serious work — faster models, more VRAM',
        gpuOptions: ['A100 40GB', 'A100 80GB'],
        vramGb: 80,
        pricePerMinute: 0.03, // ~$1.80/hr
        recommendedFor: 'Large language models, fine-tuning, batch inference',
    },
    beast: {
        name: 'Beast Mode',
        description: 'H100 cluster — maximum throughput for training & rendering',
        gpuOptions: ['H100 80GB', 'H100 8x'],
        vramGb: 640,
        pricePerMinute: 0.07, // ~$4.20/hr
        recommendedFor: 'Model training, video generation, massive parallelism',
    },
    ultra: {
        name: 'Ultra',
        description: 'Next-gen B300 — when only the best will do',
        gpuOptions: ['B300'],
        vramGb: 288,
        pricePerMinute: 0.12, // ~$7.20/hr
        recommendedFor: 'Frontier models, research, enterprise workloads',
    },
} as const;

export type GpuTier = keyof typeof GPU_TIERS;

// ── Product Tiers (Consumer) ────────────────────────────────────────────────

export const PRODUCT_TIERS = {
    burst: {
        name: 'Pump Burst',
        description: 'Pay per minute, no commitment',
        priceMonthly: 0,
        includedMinutes: 0,
        features: [
            'RTX 4090 starting tier',
            'Pay only for what you use',
            '50+ pre-loaded models',
            'Instant session start',
            'Basic support',
        ],
        cta: 'Start Free Trial',
    },
    vpn: {
        name: 'Pump VPN',
        description: 'Persistent virtual lab + included hours',
        priceMonthly: 49,
        includedMinutes: 600, // 10 hours
        features: [
            'Everything in Burst',
            '10 hours included monthly',
            'Saved environments',
            'Custom model uploads',
            'Priority GPU access',
            'Priority support',
        ],
        cta: 'Start VPN Trial',
        highlighted: true,
    },
    home: {
        name: 'Pump Home',
        description: 'Storage + hosting + inference API',
        priceMonthly: 149,
        includedMinutes: 1800, // 30 hours
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
} as const;

export type ProductTier = keyof typeof PRODUCT_TIERS;

// ── Credit Packages ────────────────────────────────────────────────────────

export const CREDIT_PACKAGES = [
    { id: 'credits-5', name: 'Starter Pack', credits: 500, price: 5, bonus: 0, stripePriceId: process.env.STRIPE_CREDITS_5_PRICE_ID || '' },
    { id: 'credits-20', name: 'Power Pack', credits: 2200, price: 20, bonus: 200, stripePriceId: process.env.STRIPE_CREDITS_20_PRICE_ID || '' },
    { id: 'credits-50', name: 'Pro Pack', credits: 6000, price: 50, bonus: 1000, stripePriceId: process.env.STRIPE_CREDITS_50_PRICE_ID || '' },
    { id: 'credits-100', name: 'Beast Pack', credits: 13000, price: 100, bonus: 3000, stripePriceId: process.env.STRIPE_CREDITS_100_PRICE_ID || '' },
] as const;

// ── Stripe Price IDs ────────────────────────────────────────────────────────

export const STRIPE_PRICE_IDS = {
    burst: process.env.STRIPE_BURST_PRICE_ID || '',
    vpn: process.env.STRIPE_VPN_PRICE_ID || '',
    home: process.env.STRIPE_HOME_PRICE_ID || '',
} as const;
