/**
 * Application Error Classes
 * 
 * Structured errors with HTTP status codes and machine-readable error codes.
 * Used throughout the API for consistent error handling.
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// ── Pre-defined error factories ──────────────────────────────────────────────

export const AuthError = {
    invalidCredentials: () =>
        new AppError('Invalid email or password', 401, 'AUTH_INVALID'),
    tokenExpired: () =>
        new AppError('Authentication token has expired', 401, 'AUTH_EXPIRED'),
    tokenMissing: () =>
        new AppError('Authentication required', 401, 'AUTH_REQUIRED'),
    forbidden: () =>
        new AppError('You do not have permission for this action', 403, 'FORBIDDEN'),
    emailTaken: () =>
        new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN'),
    accountSuspended: () =>
        new AppError('This account has been suspended', 403, 'ACCOUNT_SUSPENDED'),
};

export const NotFoundError = (resource: string) =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND');

export const ValidationError = (message: string) =>
    new AppError(message, 400, 'VALIDATION_ERROR');

export const PaymentError = {
    serviceUnavailable: () =>
        new AppError('Payment service is not configured', 503, 'PAYMENT_UNAVAILABLE'),
    insufficientCredits: () =>
        new AppError('Insufficient credit balance', 402, 'INSUFFICIENT_CREDITS'),
    checkoutFailed: (msg?: string) =>
        new AppError(msg || 'Checkout failed', 500, 'CHECKOUT_FAILED'),
};

export const ProviderError = {
    unavailable: () =>
        new AppError('No GPU capacity available. Please try again later.', 503, 'PROVIDER_UNAVAILABLE'),
    provisionFailed: (msg?: string) =>
        new AppError(msg || 'Failed to provision GPU instance', 500, 'PROVISION_FAILED'),
};

export const RateLimitError = () =>
    new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMITED');
