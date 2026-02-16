/**
 * Storage Routes — file management API for Pump Home
 *
 * FEAT-090: Object storage CRUD API
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { storageService, STORAGE_QUOTAS } from '../services/storageService.js';
import { logger } from '../lib/logger.js';

const router = Router();

// GET /api/storage/files — list user's files
router.get('/files', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const prefix = req.query.prefix as string | undefined;

    const files = await storageService.listFiles(userId, prefix);

    res.json({ success: true, data: { files } });
}));

// GET /api/storage/usage — get storage usage
router.get('/usage', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    const usage = await storageService.getStorageUsage(userId);

    // Get user tier for quota
    const { prisma } = await import('../lib/prisma.js');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
    const quota = STORAGE_QUOTAS[user?.tier || 'free'] || STORAGE_QUOTAS.free;

    res.json({
        success: true,
        data: {
            ...usage,
            quotaBytes: quota,
            quotaUsedPercent: (usage.totalBytes / quota) * 100,
        },
    });
}));

// POST /api/storage/upload — upload a file
router.post('/upload', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;

    // Check quota before upload
    const { prisma } = await import('../lib/prisma.js');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
    const quota = STORAGE_QUOTAS[user?.tier || 'free'] || STORAGE_QUOTAS.free;
    const usage = await storageService.getStorageUsage(userId);

    if (usage.totalBytes >= quota) {
        res.status(402).json({
            success: false,
            error: 'Storage quota exceeded. Upgrade your plan for more storage.',
        });
        return;
    }

    // Handle multipart upload (simplified — in production use multer)
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', async () => {
        const body = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || 'application/octet-stream';
        const filename = (req.query.filename as string) || `upload-${Date.now()}`;
        const prefix = (req.query.prefix as string) || '';
        const key = prefix ? `${prefix}/${filename}` : filename;

        try {
            const result = await storageService.uploadFile(userId, key, body, contentType);
            res.json({ success: true, data: result });
        } catch (err) {
            logger.error('Upload failed:', err);
            res.status(500).json({ success: false, error: 'Upload failed' });
        }
    });
}));

// GET /api/storage/download/:key — get download URL
router.get('/download/*', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const key = req.params[0] || '';

    if (!key) {
        res.status(400).json({ success: false, error: 'File key required' });
        return;
    }

    const url = await storageService.getDownloadUrl(userId, key);
    res.json({ success: true, data: { url } });
}));

// DELETE /api/storage/files/:key — delete a file
router.delete('/files/*', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as Request & { userId: string }).userId;
    const key = req.params[0] || '';

    if (!key) {
        res.status(400).json({ success: false, error: 'File key required' });
        return;
    }

    await storageService.deleteFile(userId, key);
    res.json({ success: true, data: { message: 'File deleted' } });
}));

export default router;
