/**
 * Prisma Client Singleton
 * 
 * Single shared database connection for the entire API.
 * Handles connection retry, graceful shutdown, and logging.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ],
    });

// Log queries in development
if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query' as never, (e: { query: string; duration: number }) => {
        logger.debug(`Prisma Query: ${e.query} (${e.duration}ms)`);
    });
}

prisma.$on('error' as never, (e: { message: string }) => {
    logger.error(`Prisma Error: ${e.message}`);
});

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

/**
 * Test database connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        logger.error('Database connection failed:', error);
        return false;
    }
}

export default prisma;
