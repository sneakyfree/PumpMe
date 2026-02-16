/**
 * Usage Quota Service — per-tier resource limits
 *
 * Enforces session concurrency, daily minutes, storage, and API rate limits per tier
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

interface TierLimits {
    maxConcurrentSessions: number;
    dailyMinutes: number;
    monthlyMinutes: number;
    maxStorageMB: number;
    apiRatePerMinute: number;
    maxTeamMembers: number;
}

const TIER_LIMITS: Record<string, TierLimits> = {
    free: { maxConcurrentSessions: 1, dailyMinutes: 60, monthlyMinutes: 300, maxStorageMB: 500, apiRatePerMinute: 30, maxTeamMembers: 0 },
    starter: { maxConcurrentSessions: 2, dailyMinutes: 240, monthlyMinutes: 2000, maxStorageMB: 5000, apiRatePerMinute: 60, maxTeamMembers: 3 },
    pro: { maxConcurrentSessions: 5, dailyMinutes: 720, monthlyMinutes: 10000, maxStorageMB: 50000, apiRatePerMinute: 300, maxTeamMembers: 10 },
    enterprise: { maxConcurrentSessions: 20, dailyMinutes: -1, monthlyMinutes: -1, maxStorageMB: 500000, apiRatePerMinute: 1000, maxTeamMembers: 100 },
};

class UsageQuotaService {
    getLimits(tier: string): TierLimits {
        return TIER_LIMITS[tier] || TIER_LIMITS.free;
    }

    async checkSessionAllowed(userId: string, tier: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = this.getLimits(tier);

        // Check concurrent sessions
        const activeSessions = await prisma.pumpSession.count({
            where: { userId, status: { in: ['provisioning', 'running'] } },
        });
        if (activeSessions >= limits.maxConcurrentSessions) {
            return { allowed: false, reason: `Max ${limits.maxConcurrentSessions} concurrent sessions on ${tier} tier` };
        }

        // Check daily minutes (skip unlimited)
        if (limits.dailyMinutes > 0) {
            const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            const todayUsage = await prisma.pumpSession.aggregate({
                where: { userId, createdAt: { gte: todayStart } },
                _sum: { totalMinutes: true },
            });
            if ((todayUsage._sum?.totalMinutes || 0) >= limits.dailyMinutes) {
                return { allowed: false, reason: `Daily ${limits.dailyMinutes}-minute limit reached on ${tier} tier` };
            }
        }

        // Check monthly minutes (skip unlimited)
        if (limits.monthlyMinutes > 0) {
            const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
            const monthUsage = await prisma.pumpSession.aggregate({
                where: { userId, createdAt: { gte: monthStart } },
                _sum: { totalMinutes: true },
            });
            if ((monthUsage._sum?.totalMinutes || 0) >= limits.monthlyMinutes) {
                return { allowed: false, reason: `Monthly ${limits.monthlyMinutes}-minute limit reached on ${tier} tier` };
            }
        }

        return { allowed: true };
    }

    async getUsageSummary(userId: string, tier: string): Promise<{
        limits: TierLimits;
        usage: { activeSessions: number; todayMinutes: number; monthMinutes: number };
        percentages: { daily: number; monthly: number; sessions: number };
    }> {
        const limits = this.getLimits(tier);
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        const [activeSessions, todayAgg, monthAgg] = await Promise.all([
            prisma.pumpSession.count({ where: { userId, status: { in: ['provisioning', 'running'] } } }),
            prisma.pumpSession.aggregate({ where: { userId, createdAt: { gte: todayStart } }, _sum: { totalMinutes: true } }),
            prisma.pumpSession.aggregate({ where: { userId, createdAt: { gte: monthStart } }, _sum: { totalMinutes: true } }),
        ]);

        const todayMinutes = todayAgg._sum?.totalMinutes || 0;
        const monthMinutes = monthAgg._sum?.totalMinutes || 0;

        return {
            limits,
            usage: { activeSessions, todayMinutes, monthMinutes },
            percentages: {
                daily: limits.dailyMinutes > 0 ? Math.round((todayMinutes / limits.dailyMinutes) * 100) : 0,
                monthly: limits.monthlyMinutes > 0 ? Math.round((monthMinutes / limits.monthlyMinutes) * 100) : 0,
                sessions: Math.round((activeSessions / limits.maxConcurrentSessions) * 100),
            },
        };
    }
}

export const usageQuota = new UsageQuotaService();
