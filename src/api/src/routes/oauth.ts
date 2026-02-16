/**
 * Google OAuth Routes — OAuth 2.0 sign-in
 *
 * FEAT-029: Google OAuth integration
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { logger } from '../lib/logger.js';
import { JWT_SECRET } from '../config/env.js';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/oauth/google/callback';

// GET /api/oauth/google — redirect to Google consent screen
router.get('/google', (_req: Request, res: Response) => {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// GET /api/oauth/google/callback — handle Google callback
router.get('/google/callback', asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
        res.redirect('/?error=oauth_cancelled');
        return;
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code: code as string,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });

    if (!tokenRes.ok) {
        logger.error('Google token exchange failed');
        res.redirect('/?error=oauth_failed');
        return;
    }

    const tokens = await tokenRes.json() as { id_token?: string };

    // Decode ID token (in production, verify with Google's public keys)
    const payload = JSON.parse(Buffer.from((tokens.id_token || '').split('.')[1], 'base64').toString());
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
        res.redirect('/?error=no_email');
        return;
    }

    // Find or create user
    let user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
        // Link Google account if not yet linked
        if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId, emailVerified: true, avatarUrl: user.avatarUrl || picture },
            });
        }
        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
    } else {
        // Create new user
        user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                googleId,
                emailVerified: true,
                avatarUrl: picture,
                tier: 'free',
                creditBalance: 100, // Welcome credits
            },
        });
        logger.info(`New Google OAuth user: ${user.id}`);
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user.id, email: user.email, tier: user.tier },
        JWT_SECRET,
        { expiresIn: '7d' },
    );

    // Set cookie and redirect to dashboard
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect('/?page=dashboard');
}));

export default router;
