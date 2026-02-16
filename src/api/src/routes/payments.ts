/**
 * Payments Routes — Stripe Integration
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AuthError, PaymentError } from '../lib/errors.js';
import { sendSuccess } from '../lib/response.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { PRODUCT_TIERS, CREDIT_PACKAGES, STRIPE_PRICE_IDS } from '../config/pricing.js';
import { JWT_SECRET } from '../config/env.js';

const router = Router();

// Initialize Stripe (undefined if no key)
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion })
    : null;

function requireUserId(req: Request): string {
    const token = req.cookies?.token ||
        (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) throw AuthError.tokenMissing();
    try {
        return (jwt.verify(token, JWT_SECRET) as { userId: string }).userId;
    } catch { throw AuthError.tokenExpired(); }
}

// GET /api/payments/pricing
router.get('/pricing', (_req: Request, res: Response) => {
    const tiers = Object.entries(PRODUCT_TIERS).map(([key, tier]) => ({ id: key, ...tier }));
    sendSuccess(res, { tiers, creditPackages: CREDIT_PACKAGES });
});

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);

    if (!stripe) {
        throw PaymentError.serviceUnavailable();
    }

    const { tier, type } = req.body; // tier: burst/vpn/home, type: 'subscription' | 'credits'

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AuthError.invalidCredentials();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId } });
        customerId = customer.id;
        await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    // Determine price
    const priceId = STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId) {
        throw PaymentError.checkoutFailed('Invalid pricing tier');
    }

    const isSubscription = tier === 'vpn' || tier === 'home';

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/dashboard?payment=success`,
        cancel_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/pricing?payment=cancelled`,
        metadata: { userId, tier },
    });

    logger.info(`Checkout session created for user ${userId}: ${session.id}`);

    sendSuccess(res, { sessionId: session.id, url: session.url });
}));

// POST /api/payments/webhook
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
    if (!stripe) {
        throw PaymentError.serviceUnavailable();
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw PaymentError.serviceUnavailable();
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        logger.error('Webhook signature verification failed:', err);
        throw PaymentError.checkoutFailed('Webhook verification failed');
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const tier = session.metadata?.tier;

            if (userId && tier) {
                // Update user tier
                await prisma.user.update({
                    where: { id: userId },
                    data: { tier },
                });

                // Create transaction record
                await prisma.transaction.create({
                    data: {
                        userId,
                        type: 'subscription',
                        amount: session.amount_total || 0,
                        description: `${tier} plan subscription`,
                        stripePaymentId: session.payment_intent as string,
                    },
                });

                logger.info(`Payment completed: user ${userId} upgraded to ${tier}`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;

            const user = await prisma.user.findFirst({
                where: { stripeCustomerId: customerId },
            });

            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tier: 'free' },
                });
                logger.info(`Subscription cancelled for user ${user.id}`);
            }
            break;
        }
    }

    sendSuccess(res, { received: true });
}));

// POST /api/payments/refund
router.post('/refund', asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { transactionId, reason } = req.body;

    if (!transactionId) {
        throw PaymentError.checkoutFailed('transactionId is required');
    }

    // Find the original transaction
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
        throw PaymentError.checkoutFailed('Transaction not found');
    }

    // Check 48-hour refund window
    const hoursSinceTransaction = (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceTransaction > 48) {
        throw PaymentError.checkoutFailed('Refund window expired (48 hours). Contact support for assistance.');
    }

    // Check if already refunded
    const existingRefund = await prisma.transaction.findFirst({
        where: { userId, type: 'refund', description: { contains: transactionId } },
    });
    if (existingRefund) {
        throw PaymentError.checkoutFailed('This transaction has already been refunded');
    }

    let stripeRefundId: string | null = null;

    // If there's a Stripe payment, refund via Stripe
    if (transaction.stripePaymentId && stripe) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: transaction.stripePaymentId,
                reason: 'requested_by_customer',
            });
            stripeRefundId = refund.id;
            logger.info(`Stripe refund created: ${refund.id} for transaction ${transactionId}`);
        } catch (err) {
            logger.error('Stripe refund failed:', err);
            throw PaymentError.checkoutFailed('Failed to process Stripe refund. Contact support.');
        }
    } else {
        // Credit-only refund: add credits back
        await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { increment: Math.abs(transaction.amount) } },
        });
    }

    // Create refund transaction record
    await prisma.transaction.create({
        data: {
            userId,
            type: 'refund',
            amount: -Math.abs(transaction.amount),
            description: `Refund for transaction ${transactionId}${reason ? `: ${reason}` : ''}`,
            stripePaymentId: stripeRefundId,
        },
    });

    logger.info(`Refund processed for user ${userId}: $${(Math.abs(transaction.amount) / 100).toFixed(2)}`);

    sendSuccess(res, {
        refunded: true,
        amount: Math.abs(transaction.amount),
        amountFormatted: `$${(Math.abs(transaction.amount) / 100).toFixed(2)}`,
        stripeRefundId,
    });
}));

export default router;
