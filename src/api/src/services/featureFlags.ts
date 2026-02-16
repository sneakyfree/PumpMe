/**
 * Feature Flags Service — simple env-based feature flagging
 *
 * Supports tier-gated, percentage rollout, and user-specific flags
 */

import { logger } from '../lib/logger.js';

interface FeatureFlag {
    enabled: boolean;
    description: string;
    tiers?: string[];           // Restrict to certain tiers
    rolloutPercent?: number;    // 0-100 percentage rollout
    allowedUserIds?: string[];  // Specific user whitelist
}

const FLAGS: Record<string, FeatureFlag> = {
    // Core features
    'pump.sessions': { enabled: true, description: 'GPU pump sessions' },
    'pump.vpn': { enabled: true, description: 'Pump VPN persistent labs', tiers: ['pro', 'enterprise'] },
    'pump.home': { enabled: true, description: 'Pump Home subscription', tiers: ['starter', 'pro', 'enterprise'] },

    // Growth features
    'referral.program': { enabled: true, description: 'Referral reward program' },
    'leaderboard': { enabled: true, description: 'Community leaderboard' },
    'teams': { enabled: true, description: 'Team management', tiers: ['pro', 'enterprise'] },

    // Beta features
    'ai.chat.v2': { enabled: false, description: 'Enhanced AI chat', rolloutPercent: 10 },
    'model.fine_tuning': { enabled: false, description: 'Custom model fine-tuning', tiers: ['enterprise'] },
    'storage.large_files': { enabled: false, description: 'Files > 5GB', rolloutPercent: 25 },

    // Infrastructure
    'websocket.events': { enabled: true, description: 'Real-time WebSocket events' },
    'email.verification': { enabled: true, description: 'Email verification required for billing' },
    'content.filter': { enabled: true, description: 'Content policy enforcement' },
};

class FeatureFlagService {
    private flags: Record<string, FeatureFlag>;

    constructor() {
        this.flags = { ...FLAGS };
        this.loadFromEnv();
    }

    /**
     * Override flags from environment variables
     * Format: FF_FEATURE_NAME=true/false
     */
    private loadFromEnv(): void {
        for (const [key, flag] of Object.entries(this.flags)) {
            const envKey = `FF_${key.replace(/\./g, '_').toUpperCase()}`;
            const envValue = process.env[envKey];
            if (envValue !== undefined) {
                flag.enabled = envValue === 'true' || envValue === '1';
                logger.info(`Feature flag ${key} overridden to ${flag.enabled} via env`);
            }
        }
    }

    /**
     * Check if a feature is enabled for a specific user context
     */
    isEnabled(flagName: string, context?: { userId?: string; tier?: string }): boolean {
        const flag = this.flags[flagName];
        if (!flag) return false;
        if (!flag.enabled) return false;

        // Tier restriction
        if (flag.tiers && context?.tier) {
            if (!flag.tiers.includes(context.tier)) return false;
        }

        // User whitelist
        if (flag.allowedUserIds && context?.userId) {
            if (flag.allowedUserIds.includes(context.userId)) return true;
        }

        // Percentage rollout
        if (flag.rolloutPercent !== undefined && flag.rolloutPercent < 100) {
            if (!context?.userId) return false;
            const hash = this.hashUserId(context.userId, flagName);
            if (hash > flag.rolloutPercent) return false;
        }

        return true;
    }

    /**
     * Get all flags and their statuses
     */
    getAllFlags(): Record<string, { enabled: boolean; description: string }> {
        const result: Record<string, { enabled: boolean; description: string }> = {};
        for (const [key, flag] of Object.entries(this.flags)) {
            result[key] = { enabled: flag.enabled, description: flag.description };
        }
        return result;
    }

    /**
     * Deterministic hash for consistent rollout per user
     */
    private hashUserId(userId: string, flagName: string): number {
        let hash = 0;
        const str = `${userId}:${flagName}`;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % 100;
    }
}

export const featureFlags = new FeatureFlagService();
