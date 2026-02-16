/**
 * Email Verification Service — token-based email confirmation
 *
 * FEAT-026: Email verification flow
 */

import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendVerificationEmail as sendVerifEmail } from './emailService.js';

class EmailVerificationService {
    private readonly TOKEN_EXPIRY_HOURS = 24;

    /**
     * Generate verification token and send email
     */
    async sendVerification(userId: string, email: string): Promise<void> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        // Store token (upsert to handle resends)
        await prisma.verificationToken.upsert({
            where: { userId_type: { userId, type: 'email' } },
            create: { userId, type: 'email', token, expiresAt },
            update: { token, expiresAt },
        });

        const verifyUrl = `${process.env.APP_URL || 'https://pumpme.io'}/verify-email?token=${token}`;

        // Use the existing email service to send verification
        await sendVerifEmail(userId, email);

        logger.info(`Verification email sent to ${email}`);
    }

    /**
     * Verify token and mark email as verified
     */
    async verify(token: string): Promise<{ success: boolean; message: string }> {
        const record = await prisma.verificationToken.findFirst({
            where: { token, type: 'email', expiresAt: { gt: new Date() } },
        });

        if (!record) {
            return { success: false, message: 'Invalid or expired verification token' };
        }

        // Mark user email as verified
        await prisma.user.update({
            where: { id: record.userId },
            data: { emailVerified: true },
        });

        // Delete used token
        await prisma.verificationToken.delete({ where: { id: record.id } });

        logger.info(`Email verified for user ${record.userId}`);
        return { success: true, message: 'Email verified successfully' };
    }

    /**
     * Check if user's email is verified
     */
    async isVerified(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true },
        });
        return user?.emailVerified ?? false;
    }
}

export const emailVerificationService = new EmailVerificationService();
