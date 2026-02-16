/**
 * Standard API Response Helpers
 * 
 * All API responses use the envelope format:
 *   { success: true, data: T }
 *   { success: false, error: { code: string, message: string } }
 */

import { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Send a successful response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json({
        success: true,
        data,
    });
}

/**
 * Send an error response
 */
export function sendError(res: Response, statusCode: number, code: string, message: string): void {
    res.status(statusCode).json({
        success: false,
        error: { code, message },
    });
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    pageSize: number,
): void {
    res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    });
}
