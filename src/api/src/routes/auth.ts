import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    
    // TODO: Check if user exists in DB
    // TODO: Create user in DB
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Placeholder response
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: 'user_' + Date.now(),
        email,
        name,
        tier: 'free',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // TODO: Fetch user from DB
    // TODO: Verify password
    
    const token = jwt.sign(
      { userId: 'user_placeholder', email },
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: 'user_placeholder',
        email,
        tier: 'free',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // JWT is stateless, client should discard token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  // TODO: Verify JWT and return user info
  res.json({
    user: null,
    message: 'Not authenticated',
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // TODO: Send password reset email
  res.json({ message: 'If the email exists, a reset link has been sent' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  // TODO: Verify token and update password
  res.json({ message: 'Password reset successful' });
});

export default router;
