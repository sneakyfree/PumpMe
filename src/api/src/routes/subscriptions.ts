/**
 * Subscription Routes — Stripe recurring billing
 *
 * FEAT-082: Subscribe, manage, cancel recurring plans
 * FEAT-085: Subscription management UI endpoint support
 * FEAT-086: Cancellation flow
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';
import Stripe from 'stripe';

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion })
    : null;

const SUBSCRIPTION_PLANS = {
    burst: {
        name: 'Burst Mode',
        priceId: process.env.STRIPE_BURST_PRICE_ID || '',
        monthlyPrice: 0,
        includedMinutes: 0,
        description: 'Pay-per-minute. No subscription required.',
    },
    vpn: {
        name: 'VPN Pro',
        priceId: process.env.STRIPE_VPN_PRICE_ID || '',
        monthlyPrice: 4999,
        includedMinutes: 600, // 10 hours
        description: 'Persistent GPU lab. 10 hrs included/mo.',
    },
    home: {
        name: 'Pump Home',
        priceId: process.env.STRIPE_HOME_PRICE_ID || '',
        monthlyPrice: 14999,
        includedMinutes: 3000, // 50 hours
        description: 'Storage + hosting + inference. 50 hrs included.',
    },
} as const;

// GET /api/subscriptions/plans — list available plans
router.get('/plans', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
            id,
            ...plan,
        })),
    });
});

// GET /api/subscriptions/current — get user's active subscription
router.get('/current', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const subscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['active', 'trialing'] } },
        orderBy: { createdAt: 'desc' },
    });

    res.json({
        success: true,
        data: subscription ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            includedMinutes: subscription.includedMinutes,
            usedMinutes: subscription.usedMinutes,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        } : null,
    });
}));

// POST /api/subscriptions/checkout — create Stripe subscription checkout
router.post('/checkout', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { planId } = req.body;

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
        res.status(400).json({ success: false, error: 'Invalid plan ID' });
        return;
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

    if (!stripe || !plan.priceId) {
        res.status(503).json({ success: false, error: 'Stripe not configured' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId },
        });
        customerId = customer.id;
        await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
        });
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?canceled=true`,
        metadata: { userId, planId },
    });

    logger.info(`Subscription checkout created for user ${userId}, plan ${planId}`);

    res.json({ success: true, data: { checkoutUrl: session.url } });
}));

// POST /api/subscriptions/cancel — cancel at period end
router.post('/cancel', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
    });

    if (!subscription) {
        res.status(404).json({ success: false, error: 'No active subscription' });
        return;
    }

    if (stripe && subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
    }

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
    });

    logger.info(`Subscription canceled for user ${userId}`);

    res.json({ success: true, data: { message: 'Subscription will cancel at end of billing period' } });
}));

// POST /api/subscriptions/reactivate — undo cancellation
router.post('/reactivate', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active', cancelAtPeriodEnd: true },
    });

    if (!subscription) {
        res.status(404).json({ success: false, error: 'No canceled subscription found' });
        return;
    }

    if (stripe && subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
        });
    }

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: false },
    });

    res.json({ success: true, data: { message: 'Subscription reactivated' } });
}));

export default router;
