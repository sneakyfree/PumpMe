import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { logger } from '../lib/logger.js';
import crypto from 'crypto';

const router = Router();

// Supported file types per modality
const ALLOWED_TYPES: Record<string, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
    document: ['application/pdf', 'text/plain', 'text/csv', 'application/json'],
    video: ['video/mp4', 'video/webm'],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// POST /api/upload — Upload a file for multi-modal inference
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/octet-stream')) {
        res.status(400).json({
            success: false,
            error: 'Content-Type must be multipart/form-data or application/octet-stream',
        });
        return;
    }

    // In production this would use multer/busboy to parse multipart.
    // For now, return a mock upload response that matches the API contract.
    const uploadId = `upl_${crypto.randomBytes(12).toString('hex')}`;
    const modality = (req.query.modality as string) || 'document';
    const allowedTypes = ALLOWED_TYPES[modality] || ALLOWED_TYPES.document;

    logger.info(`File upload initiated: ${uploadId} modality=${modality}`);

    res.status(201).json({
        success: true,
        data: {
            id: uploadId,
            modality,
            allowedTypes,
            maxSize: MAX_FILE_SIZE,
            status: 'ready',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
    });
}));

// GET /api/upload/:id — Get upload status
router.get('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`Upload status check: ${id}`);

    res.json({
        success: true,
        data: {
            id,
            status: 'processed',
            format: 'application/pdf',
            size: 1024 * 512,
            tokens: 2400,
            pages: 8,
        },
    });
}));

// DELETE /api/upload/:id — Delete an uploaded file
router.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`Upload deleted: ${id}`);

    res.json({
        success: true,
        data: { id, deleted: true },
    });
}));

export default router;
