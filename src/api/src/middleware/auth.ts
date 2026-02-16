/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user info to requests.
 * Supports both session tokens and API keys.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  tier: string;
  tokenType: 'session' | 'api_key';
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      tier?: string;
    };

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tier: decoded.tier || 'free',
      tokenType: 'session',
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token.',
    });
    return;
  }
}

/**
 * Optional authentication - attaches user if token provided, continues otherwise
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      tier?: string;
    };

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tier: decoded.tier || 'free',
      tokenType: 'session',
    };
  } catch {
    // Invalid token, but we don't fail - just continue without user
  }

  next();
}

/**
 * Require specific tier or higher
 */
export function requireTier(minTier: 'free' | 'starter' | 'pro' | 'enterprise') {
  const tierOrder = ['free', 'starter', 'pro', 'enterprise'];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
      return;
    }

    const userTierIndex = tierOrder.indexOf(req.user.tier);
    const requiredTierIndex = tierOrder.indexOf(minTier);

    if (userTierIndex < requiredTierIndex) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This feature requires ${minTier} tier or higher. Current: ${req.user.tier}`,
        requiredTier: minTier,
        currentTier: req.user.tier,
      });
      return;
    }

    next();
  };
}

/**
 * API Key authentication for programmatic access
 * Supports both X-API-Key header and Authorization: Bearer header
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const bearerKey = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const key = apiKey || bearerKey;

  if (!key) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required. Pass via X-API-Key header or Authorization: Bearer.',
    });
  }

  try {
    const { validateApiKey } = await import('../routes/apiKeys.js');
    const result = await validateApiKey(key);

    if (!result) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired API key.',
      });
    }

    // Look up user for tier info
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { email: true, tier: true },
    });

    req.user = {
      userId: result.userId,
      email: user?.email || '',
      tier: user?.tier || 'free',
      tokenType: 'api_key',
    };
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key validation failed.',
    });
  }
}

/**
 * Extract token from Authorization header or query param
 */
function extractToken(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check query parameter (for WebSocket connections)
  if (typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: { userId: string; email: string; tier?: string }): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      tier: user.tier || 'free',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Generate an API key
 */
export function generateApiKey(isTest: boolean = false): { key: string; prefix: string } {
  const prefix = isTest ? 'pm_test_' : 'pm_live_';
  const randomPart = Array.from({ length: 32 }, () =>
    'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
  ).join('');

  return {
    key: `${prefix}${randomPart}`,
    prefix: prefix + randomPart.slice(0, 8),
  };
}
