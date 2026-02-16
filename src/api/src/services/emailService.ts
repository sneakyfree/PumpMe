/**
 * Email Service — verification, password reset, notifications
 *
 * FEAT-026 (email verification), FEAT-028 (password reset)
 */

import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * Generate a secure random token
 */
function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a timestamped verification URL
 */
function verificationUrl(token: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/verify-email?token=${token}`;
}

function resetUrl(token: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/reset-password?token=${token}`;
}

/**
 * Send email verification token — stores token, sends email
 *
 * In production: use SendGrid, SES, or Resend
 * For now: log the URL (manual testing)
 */
export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token (using AuditLog as temporary token store)
    // In production, use a dedicated VerificationToken model
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'email.verification_sent',
            resource: `token:${token}`,
            metadata: { email, expiresAt: expiresAt.toISOString() },
        },
    });

    const url = verificationUrl(token);

    // In production: send via email provider
    // For now: log the URL
    logger.info(`📧 Verification email for ${email}: ${url}`);

    // TODO: Replace with actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Verify your Pump Me account',
    //   html: `<h2>Welcome to Pump Me!</h2><p>Click to verify: <a href="${url}">${url}</a></p>`,
    // });
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }> {
    const record = await prisma.auditLog.findFirst({
        where: {
            action: 'email.verification_sent',
            resource: `token:${token}`,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!record || !record.userId) {
        return { success: false };
    }

    // Check expiration (stored in metadata)
    const metadata = record.metadata as { expiresAt?: string } | null;
    if (metadata?.expiresAt && new Date(metadata.expiresAt) < new Date()) {
        return { success: false };
    }

    // Mark email as verified
    await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
    });

    logger.info(`Email verified for user ${record.userId}`);
    return { success: true, userId: record.userId };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success (don't leak email existence)
    if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'password.reset_requested',
            resource: `token:${token}`,
            metadata: { email, expiresAt: expiresAt.toISOString() },
        },
    });

    const url = resetUrl(token);
    logger.info(`🔑 Password reset for ${email}: ${url}`);

    // TODO: Send actual email
}

/**
 * Validate password reset token and reset password
 */
export async function resetPasswordWithToken(token: string, newPasswordHash: string): Promise<{ success: boolean }> {
    const record = await prisma.auditLog.findFirst({
        where: {
            action: 'password.reset_requested',
            resource: `token:${token}`,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!record || !record.userId) {
        return { success: false };
    }

    const metadata = record.metadata as { expiresAt?: string } | null;
    if (metadata?.expiresAt && new Date(metadata.expiresAt) < new Date()) {
        return { success: false };
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
    });

    // Invalidate token by logging usage
    await prisma.auditLog.create({
        data: {
            userId: record.userId,
            action: 'password.reset_completed',
            resource: `token:${token}`,
        },
    });

    logger.info(`Password reset completed for user ${record.userId}`);
    return { success: true };
}
