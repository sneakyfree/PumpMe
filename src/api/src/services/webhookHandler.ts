/**
 * Webhook Handler — Stripe webhook event processing
 *
 * FEAT-033: Wire Stripe checkout to real Stripe, handle all events
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion })
    : null;

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Process Stripe webhook events
 * Must be registered with `express.raw()` body parser
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
    if (!stripe) {
        res.status(503).json({ error: 'Stripe not configured' });
        return;
    }

    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
        logger.error('Webhook signature verification failed:', err);
        res.status(400).json({ error: 'Invalid signature' });
        return;
    }

    logger.info(`Stripe webhook received: ${event.type}`, { eventId: event.id });

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
                logger.info(`Unhandled webhook event: ${event.type}`);
        }
    } catch (err) {
        logger.error(`Webhook handler error for ${event.type}:`, err);
        // Return 200 to prevent Stripe retries for handler errors
    }

    res.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId) {
        logger.warn('Checkout session missing userId metadata');
        return;
    }

    if (session.mode === 'subscription' && session.subscription) {
        // Create subscription record
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

        await prisma.subscription.create({
            data: {
                userId,
                stripeSubscriptionId: subId,
                plan: planId || 'vpn',
                planId: planId || 'vpn_pro',
                planName: planId === 'home' ? 'Pump Home' : 'VPN Pro',
                status: 'active',
                includedMinutes: planId === 'home' ? 3000 : 600,
                usedMinutes: 0,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
            },
        });

        // Update user tier
        await prisma.user.update({
            where: { id: userId },
            data: { tier: planId === 'home' ? 'beast' : 'pro' },
        });

        logger.info(`Subscription created for user ${userId}, plan ${planId}`);
    }

    if (session.mode === 'payment') {
        // Credit purchase — add credits to balance
        const amount = session.amount_total || 0;

        await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { increment: amount } },
        });

        // Record transaction
        await prisma.transaction.create({
            data: {
                userId,
                type: 'credit_purchase',
                amount,
                description: `Credit purchase: $${(amount / 100).toFixed(2)}`,
                status: 'completed',
                stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
            },
        });

        logger.info(`Credits purchased for user ${userId}: $${(amount / 100).toFixed(2)}`);
    }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    if (!subId) return;

    // Reset used minutes on period renewal
    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subId },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                usedMinutes: 0,
                currentPeriodStart: new Date((invoice.period_start || 0) * 1000),
                currentPeriodEnd: new Date((invoice.period_end || 0) * 1000),
                status: 'active',
            },
        });

        logger.info(`Subscription period renewed: ${subId}`);
    }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : sub.status,
                cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
        });
    }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'canceled' },
        });

        // Downgrade user tier
        await prisma.user.update({
            where: { id: subscription.userId },
            data: { tier: 'free' },
        });

        logger.info(`Subscription canceled: ${sub.id}`);
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    if (!subId) return;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subId },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'past_due' },
        });

        logger.warn(`Payment failed for subscription ${subId}, user ${subscription.userId}`);
        // TODO: Send email notification about failed payment
    }
}
