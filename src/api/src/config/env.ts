/**
 * Environment Configuration — centralized env var access with fail-fast validation
 *
 * Any required env var must crash the server at boot if missing.
 */

// ── Required ──────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
    throw new Error(
        'FATAL: JWT_SECRET environment variable is not set. Server cannot start.\n' +
        'Set it in your .env file or environment: JWT_SECRET=your-secret-key-here'
    );
}

export const JWT_SECRET: string = process.env.JWT_SECRET;

// ── Optional (with safe defaults) ─────────────────────────
export const PORT = parseInt(process.env.PORT || '3001', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
export const SD_API_URL = process.env.SD_API_URL || '';
