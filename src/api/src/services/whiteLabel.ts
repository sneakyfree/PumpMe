/**
 * White-Label Config Service — partner branding & customization
 *
 * FEAT-113: White-label partner system
 */

import { logger } from '../lib/logger.js';

interface WhiteLabelConfig {
    partnerId: string;
    brandName: string;
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    domain: string;
    supportEmail: string;
    features: string[];
    tierOverrides?: Record<string, { name: string; price: number }>;
    hideFooter?: boolean;
    customCss?: string;
}

const PARTNER_CONFIGS: Record<string, WhiteLabelConfig> = {
    default: {
        partnerId: 'pumpme',
        brandName: 'PumpMe',
        logoUrl: '/logo.svg',
        primaryColor: '#00d4ff',
        accentColor: '#7c3aed',
        domain: 'pumpme.io',
        supportEmail: 'support@pumpme.io',
        features: ['sessions', 'models', 'billing', 'storage', 'teams', 'leaderboard', 'referrals'],
    },
};

class WhiteLabelService {
    private configs = new Map<string, WhiteLabelConfig>();

    constructor() {
        for (const [key, config] of Object.entries(PARTNER_CONFIGS)) {
            this.configs.set(key, config);
        }
        this.loadFromEnv();
    }

    private loadFromEnv(): void {
        const partnerId = process.env.WHITE_LABEL_PARTNER;
        if (partnerId && partnerId !== 'default') {
            const config: WhiteLabelConfig = {
                partnerId,
                brandName: process.env.WL_BRAND_NAME || 'GPU Cloud',
                logoUrl: process.env.WL_LOGO_URL || '/logo.svg',
                primaryColor: process.env.WL_PRIMARY_COLOR || '#00d4ff',
                accentColor: process.env.WL_ACCENT_COLOR || '#7c3aed',
                domain: process.env.WL_DOMAIN || 'localhost',
                supportEmail: process.env.WL_SUPPORT_EMAIL || 'support@gpu.cloud',
                features: (process.env.WL_FEATURES || 'sessions,models,billing').split(','),
            };
            this.configs.set(partnerId, config);
            logger.info(`White-label config loaded for partner: ${partnerId}`);
        }
    }

    getConfig(partnerId?: string): WhiteLabelConfig {
        const id = partnerId || process.env.WHITE_LABEL_PARTNER || 'default';
        return this.configs.get(id) || this.configs.get('default')!;
    }

    registerPartner(config: WhiteLabelConfig): void {
        this.configs.set(config.partnerId, config);
        logger.info(`White-label partner registered: ${config.partnerId}`);
    }

    isFeatureEnabled(partnerId: string, feature: string): boolean {
        const config = this.getConfig(partnerId);
        return config.features.includes(feature);
    }

    getBranding(partnerId?: string): { brandName: string; logoUrl: string; primaryColor: string; accentColor: string; supportEmail: string } {
        const config = this.getConfig(partnerId);
        return {
            brandName: config.brandName,
            logoUrl: config.logoUrl,
            primaryColor: config.primaryColor,
            accentColor: config.accentColor,
            supportEmail: config.supportEmail,
        };
    }
}

export const whiteLabel = new WhiteLabelService();
