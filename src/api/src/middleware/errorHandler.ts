/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown by routes and converts them
 * to structured API error responses.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { ZodError } from 'zod';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Already sent a response
    if (res.headersSent) {
        return;
    }

    // Zod validation errors
    if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: messages,
            },
        });
        return;
    }

    // Our structured application errors
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logger.error(`[${err.code}] ${err.message}`, {
                stack: err.stack,
                path: req.path,
                method: req.method,
            });
        } else {
            logger.warn(`[${err.code}] ${err.message}`, {
                path: req.path,
                method: req.method,
            });
        }

        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
        return;
    }

    // Unexpected errors — don't leak details in production
    logger.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message:
                process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : err.message,
        },
    });
}
