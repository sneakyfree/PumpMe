/**
 * Billing Routes — Real Prisma + Unified Pricing
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AuthError, AppError } from '../lib/errors.js';
import { sendSuccess } from '../lib/response.js';
import { prisma } from '../lib/prisma.js';
import { CREDIT_PACKAGES, PRODUCT_TIERS } from '../config/pricing.js';
import { JWT_SECRET } from '../config/env.js';

const router = Router();

function requireUserId(req: Request): string {
  const token = req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) throw AuthError.tokenMissing();
  try {
    return (jwt.verify(token, JWT_SECRET) as { userId: string }).userId;
  } catch { throw AuthError.tokenExpired(); }
}

// GET /api/billing/credit-packages
router.get('/credit-packages', (_req: Request, res: Response) => {
  sendSuccess(res, { packages: CREDIT_PACKAGES });
});

// GET /api/billing/subscription-tiers
router.get('/subscription-tiers', (_req: Request, res: Response) => {
  const tiers = Object.entries(PRODUCT_TIERS).map(([key, tier]) => ({ id: key, ...tier }));
  sendSuccess(res, { tiers });
});

// GET /api/billing/balance
router.get('/balance', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true, tier: true },
  });
  if (!user) throw AuthError.invalidCredentials();

  // Check active subscription
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });

  sendSuccess(res, {
    credits: user.creditBalance,
    creditsFormatted: `$${(user.creditBalance / 100).toFixed(2)}`,
    tier: user.tier,
    subscription: subscription ? {
      plan: subscription.plan,
      includedMinutes: subscription.includedMinutes,
      usedMinutes: subscription.usedMinutes,
      currentPeriodEnd: subscription.currentPeriodEnd,
    } : null,
  });
}));

// GET /api/billing/transactions
router.get('/transactions', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  sendSuccess(res, {
    transactions,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}));

// GET /api/billing/usage
router.get('/usage', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

  // Get usage for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sessions = await prisma.pumpSession.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
      status: 'terminated',
    },
    select: { totalMinutes: true, totalCost: true, tier: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalMinutes = sessions.reduce((sum: number, s: { totalMinutes: number | null }) => sum + (s.totalMinutes || 0), 0);
  const totalCost = sessions.reduce((sum: number, s: { totalCost: number | null }) => sum + (s.totalCost || 0), 0);

  sendSuccess(res, {
    period: '30d',
    totalMinutes,
    totalCost,
    totalCostFormatted: `$${(totalCost / 100).toFixed(2)}`,
    sessionCount: sessions.length,
    sessions: sessions.slice(0, 10),
  });
}));

// GET /api/billing/invoices
router.get('/invoices', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

  const transactions = await prisma.transaction.findMany({
    where: { userId, type: { in: ['session_charge', 'credit_purchase', 'subscription'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const invoices = transactions.map((t: { id: string; createdAt: Date; type: string; amount: number | null; description: string }) => ({
    id: t.id,
    date: t.createdAt,
    type: t.type,
    amount: t.amount,
    amountFormatted: `$${((t.amount || 0) / 100).toFixed(2)}`,
    description: t.description,
    status: 'paid',
  }));

  sendSuccess(res, { invoices });
}));

// PATCH /api/billing/auto-topup
router.patch('/auto-topup', asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { enabled, threshold, amount } = req.body;

  if (typeof enabled !== 'boolean') {
    throw new AppError('enabled (boolean) is required', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AuthError.invalidCredentials();

  const currentMetadata = (user.metadata as Record<string, unknown>) || {};
  const updatedMetadata = {
    ...currentMetadata,
    autoTopUpEnabled: enabled,
    autoTopUpThreshold: threshold || 500,   // default $5
    autoTopUpAmount: amount || 2000,         // default $20
  };

  await prisma.user.update({
    where: { id: userId },
    data: { metadata: updatedMetadata },
  });

  sendSuccess(res, {
    autoTopUp: {
      enabled,
      threshold: updatedMetadata.autoTopUpThreshold,
      amount: updatedMetadata.autoTopUpAmount,
      thresholdFormatted: `$${((updatedMetadata.autoTopUpThreshold as number) / 100).toFixed(2)}`,
      amountFormatted: `$${((updatedMetadata.autoTopUpAmount as number) / 100).toFixed(2)}`,
    },
  });
}));

export default router;
