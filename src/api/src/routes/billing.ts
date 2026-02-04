import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Credit packages available
const CREDIT_PACKAGES = {
  starter: { credits: 10, price: 10, bonus: 0 },
  regular: { credits: 50, price: 45, bonus: 5 },
  pro: { credits: 100, price: 80, bonus: 20 },
  whale: { credits: 500, price: 350, bonus: 150 },
};

// Subscription tiers
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    includedMinutes: 5, // 5 minutes Beast Mode free
    features: ['5 min Beast Mode free', 'Basic support'],
  },
  pump_vpn: {
    name: 'Pump VPN',
    price: 49,
    includedMinutes: 120,
    features: ['120 min/month included', 'Persistent environment', 'Priority support'],
  },
  pump_home: {
    name: 'Pump Home',
    price: 149,
    includedMinutes: 480,
    features: ['480 min/month included', '500GB storage', 'Inference API', '24/7 support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    includedMinutes: 'unlimited',
    features: ['Unlimited usage', 'Dedicated GPUs', 'SLA', 'Custom integrations'],
  },
};

// GET /api/billing/packages - Get credit packages
router.get('/packages', (req, res) => {
  res.json({
    packages: CREDIT_PACKAGES,
    currency: 'USD',
    message: 'Buy credits to pump anytime',
  });
});

// GET /api/billing/subscriptions - Get subscription tiers
router.get('/subscriptions', (req, res) => {
  res.json({
    tiers: SUBSCRIPTION_TIERS,
    currency: 'USD',
    message: 'Subscribe for monthly included minutes',
  });
});

// GET /api/billing/balance - Get user's credit balance
router.get('/balance', (req, res) => {
  // TODO: Fetch from DB for authenticated user
  res.json({
    credits: 0,
    freeMinutesRemaining: 5,
    subscription: 'free',
    nextBillingDate: null,
  });
});

// POST /api/billing/purchase - Purchase credits
router.post('/purchase', async (req, res) => {
  const { packageId } = req.body;
  
  if (!CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES]) {
    return res.status(400).json({ error: 'Invalid package' });
  }
  
  // TODO: Create Stripe checkout session
  res.json({
    checkoutUrl: 'https://checkout.stripe.com/placeholder',
    message: 'Redirecting to payment...',
  });
});

// POST /api/billing/subscribe - Subscribe to a plan
router.post('/subscribe', async (req, res) => {
  const { tierId } = req.body;
  
  if (!SUBSCRIPTION_TIERS[tierId as keyof typeof SUBSCRIPTION_TIERS]) {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  
  // TODO: Create Stripe subscription
  res.json({
    checkoutUrl: 'https://checkout.stripe.com/placeholder',
    message: 'Redirecting to subscription setup...',
  });
});

// POST /api/billing/webhook - Stripe webhook handler
router.post('/webhook', async (req, res) => {
  // TODO: Verify Stripe signature
  // TODO: Handle checkout.session.completed, invoice.paid, etc.
  res.json({ received: true });
});

// GET /api/billing/invoices - Get user's invoices
router.get('/invoices', (req, res) => {
  // TODO: Fetch from Stripe/DB
  res.json({
    invoices: [],
    total: 0,
  });
});

// GET /api/billing/usage - Get usage history
router.get('/usage', (req, res) => {
  const { startDate, endDate } = req.query;
  
  // TODO: Fetch from DB
  res.json({
    usage: [],
    totalMinutes: 0,
    totalCost: 0,
    period: { start: startDate, end: endDate },
  });
});

export default router;
