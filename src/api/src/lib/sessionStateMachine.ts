/**
 * Session State Machine — enforces valid state transitions for GPU sessions.
 *
 * States: pending → provisioning → ready → active → terminated
 *                                    ↕ paused
 *
 * FEAT-049
 */

export type SessionState =
    | 'pending'       // Request received, awaiting provider assignment
    | 'provisioning'  // Provider is spinning up the GPU
    | 'ready'         // GPU is ready, model is loading
    | 'active'        // Session is running, user is connected
    | 'paused'        // Session paused by user (billing paused)
    | 'terminated'    // Session ended (by user, timeout, or error)
    | 'error';        // Unrecoverable error

// Valid state transitions
const transitions: Record<SessionState, SessionState[]> = {
    pending: ['provisioning', 'terminated', 'error'],
    provisioning: ['ready', 'terminated', 'error'],
    ready: ['active', 'terminated', 'error'],
    active: ['paused', 'terminated', 'error'],
    paused: ['active', 'terminated', 'error'],
    terminated: [],  // Final state
    error: ['terminated'],  // Can only be cleaned up
};

/**
 * Check if a state transition is valid
 */
export function canTransition(from: SessionState, to: SessionState): boolean {
    return transitions[from]?.includes(to) ?? false;
}

/**
 * Attempt a state transition, throwing if invalid
 */
export function assertTransition(from: SessionState, to: SessionState): void {
    if (!canTransition(from, to)) {
        throw new Error(
            `Invalid state transition: ${from} → ${to}. ` +
            `Valid transitions from '${from}': [${transitions[from].join(', ')}]`
        );
    }
}

/**
 * Check if a session is in a billable state
 */
export function isBillable(state: SessionState): boolean {
    return state === 'active';
}

/**
 * Check if a session is in a terminal state
 */
export function isTerminal(state: SessionState): boolean {
    return state === 'terminated' || state === 'error';
}

/**
 * Check if a session can be stopped by the user
 */
export function isStoppable(state: SessionState): boolean {
    return ['active', 'paused', 'ready', 'provisioning'].includes(state);
}

/**
 * Get human-readable label for a state
 */
export function stateLabel(state: SessionState): string {
    const labels: Record<SessionState, string> = {
        pending: '⏳ Pending',
        provisioning: '🔧 Setting Up',
        ready: '✅ Ready',
        active: '🟢 Running',
        paused: '⏸️ Paused',
        terminated: '⬛ Terminated',
        error: '❌ Error',
    };
    return labels[state] || state;
}
