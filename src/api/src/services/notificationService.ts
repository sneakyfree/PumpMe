/**
 * Notification Service — in-app notification delivery
 *
 * FEAT-051: Real-time notification center with persistence
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface NotificationPayload {
    userId: string;
    type: 'session_started' | 'session_ended' | 'session_failed' | 'credit_low' | 'payment_received'
    | 'subscription_renewed' | 'subscription_expiring' | 'quota_warning' | 'system' | 'referral_credit';
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

class NotificationService {
    /**
     * Create a notification for a user
     */
    async create(payload: NotificationPayload): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId: payload.userId,
                    type: payload.type,
                    title: payload.title,
                    message: payload.message,
                    actionUrl: payload.actionUrl,
                    metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
                    read: false,
                },
            });

            logger.info(`Notification created: ${payload.type} for user ${payload.userId}`);
        } catch (err) {
            logger.error('Failed to create notification:', err);
        }
    }

    /**
     * Get unread notifications for a user
     */
    async getUnread(userId: string, limit = 20): Promise<unknown[]> {
        return prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get all notifications for a user (paginated)
     */
    async getAll(userId: string, page = 1, limit = 20): Promise<{ notifications: unknown[]; total: number }> {
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.notification.count({ where: { userId } }),
        ]);

        return { notifications, total };
    }

    /**
     * Mark a notification as read
     */
    async markRead(notificationId: string, userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { read: true },
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: { userId, read: false },
        });
    }

    // --- Convenience methods ---

    async notifySessionStarted(userId: string, modelName: string, tier: string): Promise<void> {
        await this.create({
            userId,
            type: 'session_started',
            title: '🚀 Session Started',
            message: `Your ${tier} session with ${modelName} is now active.`,
            actionUrl: '/workspace',
        });
    }

    async notifySessionEnded(userId: string, duration: number, cost: number): Promise<void> {
        await this.create({
            userId,
            type: 'session_ended',
            title: '✅ Session Complete',
            message: `Session ended after ${duration}m. Total cost: $${(cost / 100).toFixed(2)}.`,
            actionUrl: '/history',
        });
    }

    async notifyCreditLow(userId: string, balance: number): Promise<void> {
        await this.create({
            userId,
            type: 'credit_low',
            title: '⚠️ Low Credits',
            message: `Your credit balance is $${(balance / 100).toFixed(2)}. Add credits to avoid session interruptions.`,
            actionUrl: '/billing',
        });
    }

    async notifyReferralCredit(userId: string, amount: number, refereeName: string): Promise<void> {
        await this.create({
            userId,
            type: 'referral_credit',
            title: '🎉 Referral Bonus',
            message: `${refereeName} joined via your referral! You earned $${(amount / 100).toFixed(2)} in credits.`,
            actionUrl: '/profile',
        });
    }
}

export const notificationService = new NotificationService();
