/**
 * Team Management Routes — team creation, members, shared billing
 *
 * FEAT-113: Team/organization management
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/teams — user's teams
router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const memberships = await prisma.teamMember.findMany({
        where: { userId },
        include: {
            team: {
                include: {
                    members: { select: { userId: true, role: true } },
                },
            },
        },
    });

    const teams = memberships.map(m => ({
        id: m.team.id,
        name: m.team.name,
        slug: m.team.slug,
        myRole: m.role,
        memberCount: m.team.members.length,
        plan: m.team.plan,
        createdAt: m.team.createdAt,
    }));

    res.json({ success: true, data: { teams } });
}));

// POST /api/teams — create a team
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { name } = req.body;

    if (!name || name.length < 2) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Team name must be at least 2 characters' } });
        return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Team name already taken' } });
        return;
    }

    const team = await prisma.team.create({
        data: {
            name,
            slug,
            ownerId: userId,
            plan: 'free',
            members: {
                create: { userId, role: 'owner' },
            },
        },
        include: { members: true },
    });

    res.status(201).json({ success: true, data: { team } });
}));

// POST /api/teams/:id/invite — invite member
router.post('/:id/invite', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const { email, role } = req.body;

    // Verify user is owner/admin
    const membership = await prisma.teamMember.findFirst({
        where: { teamId: req.params.id, userId, role: { in: ['owner', 'admin'] } },
    });

    if (!membership) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only owners and admins can invite' } });
        return;
    }

    // Find user by email
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
    }

    // Check if already member
    const existingMember = await prisma.teamMember.findFirst({
        where: { teamId: req.params.id, userId: invitee.id },
    });

    if (existingMember) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'User is already a team member' } });
        return;
    }

    await prisma.teamMember.create({
        data: {
            teamId: req.params.id,
            userId: invitee.id,
            role: role || 'member',
        },
    });

    res.json({ success: true, data: { message: `${email} added to team` } });
}));

// DELETE /api/teams/:id/members/:userId — remove member
router.delete('/:id/members/:memberId', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    // Verify user is owner/admin
    const membership = await prisma.teamMember.findFirst({
        where: { teamId: req.params.id, userId, role: { in: ['owner', 'admin'] } },
    });

    if (!membership) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
        return;
    }

    // Can't remove the owner
    const target = await prisma.teamMember.findFirst({
        where: { teamId: req.params.id, userId: req.params.memberId },
    });

    if (target?.role === 'owner') {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Cannot remove team owner' } });
        return;
    }

    await prisma.teamMember.deleteMany({
        where: { teamId: req.params.id, userId: req.params.memberId },
    });

    res.json({ success: true });
}));

// GET /api/teams/:id — team details
router.get('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    // Verify membership
    const membership = await prisma.teamMember.findFirst({
        where: { teamId: req.params.id, userId },
    });

    if (!membership) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a team member' } });
        return;
    }

    const team = await prisma.team.findUnique({
        where: { id: req.params.id },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, tier: true } },
                },
            },
        },
    });

    res.json({ success: true, data: { team, myRole: membership.role } });
}));

export default router;
