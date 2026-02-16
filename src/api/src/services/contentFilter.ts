/**
 * Content Policy Filter — inference content moderation
 *
 * FEAT-138: Filter harmful content through inference API
 */

import { logger } from '../lib/logger.js';

interface ContentCheckResult {
    allowed: boolean;
    reason?: string;
    category?: string;
}

// Categories of blocked content
const BLOCKED_PATTERNS: Array<{
    category: string;
    patterns: RegExp[];
    severity: 'block' | 'warn';
}> = [
        {
            category: 'violence',
            patterns: [
                /how\s+to\s+(make|build|create)\s+(a\s+)?(bomb|explosive|weapon)/i,
                /instructions?\s+for\s+(making|building)\s+(bombs?|explosives?)/i,
            ],
            severity: 'block',
        },
        {
            category: 'illegal_substances',
            patterns: [
                /how\s+to\s+(make|manufacture|synthesize)\s+(meth|cocaine|heroin|fentanyl)/i,
                /drug\s+manufacturing\s+(instructions?|guide|recipe)/i,
            ],
            severity: 'block',
        },
        {
            category: 'csam',
            patterns: [
                /child\s+(sexual|porn|exploitation)/i,
                /minor\s+(sexual|intimate|naked)/i,
            ],
            severity: 'block',
        },
        {
            category: 'self_harm',
            patterns: [
                /how\s+to\s+(commit\s+)?suicide/i,
                /suicide\s+methods/i,
            ],
            severity: 'block',
        },
        {
            category: 'malware',
            patterns: [
                /write\s+(a\s+)?(ransomware|keylogger|trojan|virus)\s+(code|program|script)/i,
                /create\s+(a\s+)?phishing\s+(page|site|email)/i,
            ],
            severity: 'block',
        },
    ];

// Rate limit tracking for suspicious users
const suspiciousUsers = new Map<string, { count: number; lastSeen: number }>();

/**
 * Check if message content violates content policy
 */
export function checkContent(content: string, userId?: string): ContentCheckResult {
    // Check against blocked patterns
    for (const rule of BLOCKED_PATTERNS) {
        for (const pattern of rule.patterns) {
            if (pattern.test(content)) {
                logger.warn(`Content policy violation: ${rule.category}`, {
                    userId,
                    severity: rule.severity,
                });

                // Track suspicious users
                if (userId) {
                    const record = suspiciousUsers.get(userId) || { count: 0, lastSeen: 0 };
                    record.count++;
                    record.lastSeen = Date.now();
                    suspiciousUsers.set(userId, record);

                    // Repeated violations get escalated
                    if (record.count >= 5) {
                        logger.error(`Repeated content violations from user: ${userId} (${record.count} violations)`);
                    }
                }

                return {
                    allowed: false,
                    reason: `Content violates our Acceptable Use Policy (${rule.category}). Please review our AUP at /aup.`,
                    category: rule.category,
                };
            }
        }
    }

    return { allowed: true };
}

/**
 * Check all messages in a chat completion request
 */
export function checkMessages(
    messages: Array<{ role: string; content: string }>,
    userId?: string
): ContentCheckResult {
    for (const msg of messages) {
        if (msg.role === 'user' && msg.content) {
            const result = checkContent(msg.content, userId);
            if (!result.allowed) return result;
        }
    }
    return { allowed: true };
}

/**
 * Get violation count for a user (for admin review)
 */
export function getUserViolations(userId: string): number {
    return suspiciousUsers.get(userId)?.count || 0;
}

/**
 * Clean up old tracking data (run periodically)
 */
export function cleanupTracking(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    for (const [userId, record] of suspiciousUsers) {
        if (record.lastSeen < cutoff) {
            suspiciousUsers.delete(userId);
        }
    }
}
