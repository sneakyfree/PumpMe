/**
 * Async Handler Wrapper
 * 
 * Wraps async Express route handlers so thrown errors
 * are automatically caught and passed to next().
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export default asyncHandler;
