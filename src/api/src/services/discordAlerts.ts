/**
 * Discord Alerting Webhook — send critical alerts to a Discord channel
 *
 * FEAT-023
 */

import { logger } from '../lib/logger.js';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export type AlertSeverity = 'info' | 'warning' | 'critical';

const SEVERITY_COLORS: Record<AlertSeverity, number> = {
    info: 0x00d4ff,      // Cyan
    warning: 0xffd60a,   // Yellow
    critical: 0xff3b30,  // Red
};

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
};

interface AlertPayload {
    severity: AlertSeverity;
    title: string;
    description: string;
    fields?: { name: string; value: string; inline?: boolean }[];
}

/**
 * Send an alert to the Discord webhook
 */
export async function sendDiscordAlert(payload: AlertPayload): Promise<void> {
    if (!DISCORD_WEBHOOK_URL) {
        logger.debug('Discord alerting disabled (no DISCORD_WEBHOOK_URL)');
        return;
    }

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: `${SEVERITY_EMOJI[payload.severity]} ${payload.title}`,
                    description: payload.description,
                    color: SEVERITY_COLORS[payload.severity],
                    fields: payload.fields?.map(f => ({
                        name: f.name,
                        value: f.value,
                        inline: f.inline ?? true,
                    })),
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Pump Me Alerts' },
                }],
            }),
        });
    } catch (err) {
        logger.error('Failed to send Discord alert:', err);
    }
}

// Pre-built alert helpers
export function alertZombieCleanup(sessionCount: number): void {
    sendDiscordAlert({
        severity: sessionCount > 5 ? 'warning' : 'info',
        title: 'Zombie Session Cleanup',
        description: `Terminated ${sessionCount} zombie session(s)`,
        fields: [
            { name: 'Sessions', value: `${sessionCount}`, inline: true },
            { name: 'Timestamp', value: new Date().toLocaleString(), inline: true },
        ],
    });
}

export function alertProviderDown(provider: string, error: string): void {
    sendDiscordAlert({
        severity: 'critical',
        title: `Provider Down: ${provider}`,
        description: `GPU provider "${provider}" is unreachable`,
        fields: [
            { name: 'Provider', value: provider, inline: true },
            { name: 'Error', value: error.slice(0, 200), inline: false },
        ],
    });
}

export function alertHighSpend(userId: string, amount: number): void {
    sendDiscordAlert({
        severity: 'warning',
        title: 'High Spend Alert',
        description: `User ${userId} has spent $${(amount / 100).toFixed(2)} in the last hour`,
        fields: [
            { name: 'User ID', value: userId, inline: true },
            { name: 'Amount', value: `$${(amount / 100).toFixed(2)}`, inline: true },
        ],
    });
}

export function alertNewSignup(email: string): void {
    sendDiscordAlert({
        severity: 'info',
        title: 'New User Signup',
        description: `${email} just created an account`,
    });
}
