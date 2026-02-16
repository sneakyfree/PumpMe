/**
 * Authentication Routes — Real Prisma DB Integration
 *
 * POST /register — create user in DB
 * POST /login    — verify credentials from DB
 * POST /logout   — clear cookie
 * GET  /me       — get current user from DB
 * POST /forgot-password — initiate password reset
 * POST /reset-password  — complete password reset
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError, AuthError, ValidationError } from '../lib/errors.js';
import { sendSuccess } from '../lib/response.js';
import { logger } from '../lib/logger.js';
import { sendPasswordResetEmail, resetPasswordWithToken } from '../services/emailService.js';
import { emailVerificationService } from '../services/emailVerification.js';
import { JWT_SECRET } from '../config/env.js';

const router = Router();

const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BCRYPT_ROUNDS = 12;

// ── Schemas ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ── Helpers ────────────────────────────────────────────────────────────────

function generateToken(user: { id: string; email: string; tier: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, tier: user.tier },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  creditBalance: number;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    creditBalance: user.creditBalance,
    createdAt: user.createdAt,
  };
}

// ── POST /register ─────────────────────────────────────────────────────────

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    throw AuthError.emailTaken();
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name || null,
      tier: 'free',
      creditBalance: 500, // $5 welcome credits (in cents)
    },
  });

  // Generate JWT
  const token = generateToken(user);

  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  logger.info(`User registered: ${user.email} (${user.id})`);

  sendSuccess(res, { token, user: sanitizeUser(user) }, 201);
}));

// ── POST /login ────────────────────────────────────────────────────────────

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    throw AuthError.invalidCredentials();
  }

  // Verify password
  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw AuthError.invalidCredentials();
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate JWT
  const token = generateToken(user);

  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  logger.info(`User logged in: ${user.email} (${user.id})`);

  sendSuccess(res, { token, user: sanitizeUser(user) });
}));

// ── POST /logout ───────────────────────────────────────────────────────────

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  sendSuccess(res, { message: 'Logged out' });
});

// ── GET /me ────────────────────────────────────────────────────────────────

router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // Extract token from cookie or Authorization header
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    sendSuccess(res, { user: null });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      sendSuccess(res, { user: null });
      return;
    }

    sendSuccess(res, { user: sanitizeUser(user) });
  } catch {
    sendSuccess(res, { user: null });
  }
}));

// ── PATCH /me ──────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

router.patch('/me', asyncHandler(async (req: Request, res: Response) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    throw AuthError.tokenMissing();
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  const data = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: decoded.userId },
    data,
  });

  sendSuccess(res, { user: sanitizeUser(user) });
}));

// ── PUT /me/password ───────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.put('/me/password', asyncHandler(async (req: Request, res: Response) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    throw AuthError.tokenMissing();
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  const data = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.passwordHash) {
    throw AuthError.invalidCredentials();
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  logger.info(`Password changed for user: ${user.email} (${user.id})`);

  sendSuccess(res, { message: 'Password updated' });
}));

// ── POST /forgot-password ──────────────────────────────────────────────────

router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);

  // Always return success (don't reveal if email exists)
  await sendPasswordResetEmail(email.toLowerCase());

  sendSuccess(res, { message: 'If an account exists with this email, a reset link has been sent.' });
}));

// ── POST /reset-password ───────────────────────────────────────────────────

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const data = resetPasswordSchema.parse(req.body);

  // Hash the new password
  const newPasswordHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

  // Validate token and update password
  const result = await resetPasswordWithToken(data.token, newPasswordHash);

  if (!result.success) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  logger.info('Password reset completed via token');

  sendSuccess(res, { message: 'Password has been reset. You can now log in with your new password.' });
}));

// ── POST /verify-email ────────────────────────────────────────────────────

router.post('/verify-email', asyncHandler(async (req: Request, res: Response) => {
  const { token } = z.object({ token: z.string().min(1) }).parse(req.body);

  const result = await emailVerificationService.verify(token);

  if (!result.success) {
    throw new AppError(result.message || 'Invalid or expired token', 400, 'INVALID_TOKEN');
  }

  sendSuccess(res, { message: 'Email verified successfully' });
}));

// ── POST /send-phone-code ────────────────────────────────────────────────

router.post('/send-phone-code', asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) throw AuthError.tokenMissing();
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

  const { phone } = z.object({ phone: z.string().min(10) }).parse(req.body);

  // Generate 6-digit OTP
  const crypto = await import('crypto');
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.verificationToken.upsert({
    where: { userId_type: { userId: decoded.userId, type: 'phone' } },
    create: { userId: decoded.userId, type: 'phone', token: otp, expiresAt },
    update: { token: otp, expiresAt },
  });

  // In production: send via Twilio
  // For now: log the OTP
  logger.info(`📱 Phone OTP for ${phone}: ${otp}`);

  sendSuccess(res, { message: 'Verification code sent' });
}));

// ── POST /verify-phone ───────────────────────────────────────────────────

router.post('/verify-phone', asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) throw AuthError.tokenMissing();
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

  const { code } = z.object({ code: z.string().length(6) }).parse(req.body);

  const record = await prisma.verificationToken.findFirst({
    where: { userId: decoded.userId, type: 'phone', token: code, expiresAt: { gt: new Date() } },
  });

  if (!record) {
    throw new AppError('Invalid or expired verification code', 400, 'INVALID_CODE');
  }

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { phoneVerified: true },
  });

  await prisma.verificationToken.delete({ where: { id: record.id } });

  sendSuccess(res, { message: 'Phone verified successfully' });
}));

export default router;
