/**
 * Zombie Session Cleanup Job
 *
 * Runs on a periodic interval to detect and terminate sessions that have
 * been left running without activity. Prevents runaway billing.
 *
 * FEAT-054
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { broadcastStatusChange } from '../lib/realtime.js';

const ZOMBIE_THRESHOLD_MINUTES = 30;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Find and terminate zombie sessions
 */
async function cleanupZombieSessions(): Promise<number> {
    const cutoff = new Date(Date.now() - ZOMBIE_THRESHOLD_MINUTES * 60 * 1000);

    try {
        // Find sessions that have been active/ready but not updated recently
        const zombies = await prisma.pumpSession.findMany({
            where: {
                status: { in: ['active', 'ready', 'provisioning'] },
                updatedAt: { lt: cutoff },
            },
            select: {
                id: true,
                userId: true,
                status: true,
                updatedAt: true,
                totalMinutes: true,
                totalCost: true,
            },
        });

        if (zombies.length === 0) return 0;

        logger.warn(`🧟 Found ${zombies.length} zombie session(s) to clean up`);

        for (const zombie of zombies) {
            try {
                // Terminate the session
                await prisma.pumpSession.update({
                    where: { id: zombie.id },
                    data: {
                        status: 'terminated',
                        terminatedAt: new Date(),
                        terminationReason: 'zombie_cleanup',
                    },
                });

                // Create a transaction record for any final billing
                if (zombie.totalCost > 0) {
                    await prisma.transaction.create({
                        data: {
                            userId: zombie.userId,
                            type: 'session_charge',
                            amount: -zombie.totalCost,
                            description: `Auto-terminated session ${zombie.id.slice(0, 8)} (inactive ${ZOMBIE_THRESHOLD_MINUTES}+ min)`,
                            sessionId: zombie.id,
                        },
                    });
                }

                // Broadcast termination to any connected clients
                broadcastStatusChange(zombie.id, 'terminated', {
                    reason: 'zombie_cleanup',
                    message: `Session auto-terminated after ${ZOMBIE_THRESHOLD_MINUTES} minutes of inactivity`,
                });

                logger.info(`🧟 Terminated zombie session ${zombie.id} (last activity: ${zombie.updatedAt.toISOString()})`);
            } catch (err) {
                logger.error(`Failed to clean up zombie session ${zombie.id}:`, err);
            }
        }

        return zombies.length;
    } catch (err) {
        logger.error('Zombie cleanup job failed:', err);
        return 0;
    }
}

/**
 * Start the zombie cleanup scheduler
 */
export function startZombieCleanup(): void {
    if (cleanupTimer) return; // Already running

    // Run once immediately
    cleanupZombieSessions().then(count => {
        if (count > 0) logger.info(`🧹 Initial cleanup: terminated ${count} zombie(s)`);
    });

    // Schedule recurring runs
    cleanupTimer = setInterval(async () => {
        const count = await cleanupZombieSessions();
        if (count > 0) logger.info(`🧹 Periodic cleanup: terminated ${count} zombie(s)`);
    }, CLEANUP_INTERVAL_MS);

    logger.info(`🧹 Zombie session cleanup scheduled every ${CLEANUP_INTERVAL_MS / 60000} minutes (threshold: ${ZOMBIE_THRESHOLD_MINUTES} min)`);
}

/**
 * Stop the zombie cleanup scheduler
 */
export function stopZombieCleanup(): void {
    if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
        logger.info('🧹 Zombie session cleanup stopped');
    }
}
