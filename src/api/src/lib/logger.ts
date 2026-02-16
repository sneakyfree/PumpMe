/**
 * Structured Logger (Winston)
 * 
 * JSON-formatted logs with request IDs and log levels.
 * Console transport for dev, file transport for production.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for development (readable)
const devFormat = printf(({ level, message, timestamp, requestId, ...meta }) => {
    const rid = requestId ? `[${requestId}] ` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${rid}${message}${metaStr}`;
});

// JSON format for production
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json()
);

const isDev = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    defaultMeta: { service: 'pumpme-api' },
    format: isDev
        ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), devFormat)
        : prodFormat,
    transports: [
        new winston.transports.Console(),
        ...(isDev
            ? []
            : [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 10 * 1024 * 1024,
                    maxFiles: 5,
                }),
            ]),
    ],
});

export default logger;
