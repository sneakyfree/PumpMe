/**
 * Audit Logging Service — immutable audit trail for security-critical actions
 *
 * FEAT-145
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export type AuditAction =
    | 'user.register'
    | 'user.login'
    | 'user.logout'
    | 'user.login_failed'
    | 'user.password_change'
    | 'user.profile_update'
    | 'user.suspend'
    | 'user.delete'
    | 'session.create'
    | 'session.start'
    | 'session.pause'
    | 'session.terminate'
    | 'session.zombie_cleanup'
    | 'billing.credit_purchase'
    | 'billing.refund'
    | 'apikey.create'
    | 'apikey.revoke'
    | 'admin.user_suspend'
    | 'admin.user_unsuspend'
    | 'data.export_request'
    | 'data.delete_request';

interface AuditEntry {
    userId: string;
    action: AuditAction;
    resource?: string;       // e.g. "session:clxyz123" or "apikey:clxyz456"
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                action: entry.action,
                resource: entry.resource || null,
                metadata: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
                ipAddress: entry.ipAddress || null,
                userAgent: entry.userAgent || null,
            },
        });
    } catch (err) {
        // Audit logging should never crash the application
        logger.error('Failed to write audit log:', err);
    }
}

/**
 * Query audit logs with filtering and pagination
 */
export async function queryAuditLogs(opts: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}): Promise<{ logs: unknown[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (opts.userId) where.userId = opts.userId;
    if (opts.action) where.action = opts.action;
    if (opts.resource) where.resource = { contains: opts.resource };
    if (opts.startDate || opts.endDate) {
        where.createdAt = {};
        if (opts.startDate) (where.createdAt as Record<string, unknown>).gte = opts.startDate;
        if (opts.endDate) (where.createdAt as Record<string, unknown>).lte = opts.endDate;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: opts.limit || 50,
            skip: opts.offset || 0,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
}
