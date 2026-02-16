/**
 * Auto-TopUp Service — automatic credit replenishment
 *
 * FEAT-038: Auto-topup trigger logic
 * Checks user balance after session charges and triggers Stripe payment if below threshold.
 */

import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion })
    : null;

interface AutoTopUpConfig {
    enabled: boolean;
    threshold: number;  // cents — trigger when balance falls below this
    amount: number;     // cents — amount to top up
}

/**
 * Check if user's balance is below their auto-topup threshold and charge if needed
 */
export async function checkAutoTopUp(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            creditBalance: true,
            stripeCustomerId: true,
            metadata: true,
        },
    });

    if (!user) return;

    // Read auto-topup config from user metadata
    const metadata = user.metadata as Record<string, unknown> | null;
    const config: AutoTopUpConfig = {
        enabled: (metadata?.autoTopUpEnabled as boolean) ?? false,
        threshold: (metadata?.autoTopUpThreshold as number) ?? 500,   // $5.00
        amount: (metadata?.autoTopUpAmount as number) ?? 2000,        // $20.00
    };

    if (!config.enabled) return;
    if (user.creditBalance >= config.threshold) return;
    if (!stripe || !user.stripeCustomerId) {
        logger.warn(`Auto-topup skipped for user ${userId}: no Stripe customer`);
        return;
    }

    try {
        // Check for existing default payment method
        const customer = await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer;
        const defaultPaymentMethod = customer.invoice_settings?.default_payment_method as string | null;

        if (!defaultPaymentMethod) {
            logger.warn(`Auto-topup skipped for user ${userId}: no default payment method`);
            return;
        }

        // Create and confirm PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: config.amount,
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: defaultPaymentMethod,
            off_session: true,
            confirm: true,
            description: `Auto-topup: $${(config.amount / 100).toFixed(2)}`,
            metadata: { userId, type: 'auto_topup' },
        });

        if (paymentIntent.status === 'succeeded') {
            // Credit the user's balance
            await prisma.user.update({
                where: { id: userId },
                data: { creditBalance: { increment: config.amount } },
            });

            // Create transaction record
            await prisma.transaction.create({
                data: {
                    userId,
                    type: 'credit_purchase',
                    amount: config.amount,
                    description: `Auto-topup: $${(config.amount / 100).toFixed(2)}`,
                    stripePaymentId: paymentIntent.id,
                },
            });

            logger.info(`Auto-topup completed for user ${userId}: $${(config.amount / 100).toFixed(2)}`);
        }
    } catch (err) {
        logger.error(`Auto-topup failed for user ${userId}:`, err);
        // Don't throw — auto-topup failure shouldn't break the session flow
    }
}
