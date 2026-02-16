/**
 * Circuit Breaker — fault tolerance for external service calls
 *
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

import { logger } from '../lib/logger.js';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitOptions {
    failureThreshold: number;   // failures before opening
    resetTimeoutMs: number;     // time before trying again
    halfOpenMaxCalls: number;   // calls allowed in half-open
    monitorWindowMs: number;    // failure counting window
}

interface CircuitStats {
    state: CircuitState;
    failures: number;
    successes: number;
    lastFailure: Date | null;
    totalRequests: number;
    totalFailures: number;
}

const DEFAULT_OPTIONS: CircuitOptions = {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
    halfOpenMaxCalls: 3,
    monitorWindowMs: 60000,
};

class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failures = 0;
    private successes = 0;
    private halfOpenCalls = 0;
    private lastFailureTime: Date | null = null;
    private nextRetryTime: Date | null = null;
    private totalRequests = 0;
    private totalFailures = 0;

    constructor(
        private readonly name: string,
        private readonly options: CircuitOptions = DEFAULT_OPTIONS,
    ) { }

    /**
     * Execute a function through the circuit breaker
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (!this.canExecute()) {
            throw new Error(`Circuit breaker ${this.name} is OPEN — service unavailable`);
        }

        this.totalRequests++;
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    private canExecute(): boolean {
        if (this.state === 'CLOSED') return true;

        if (this.state === 'OPEN') {
            if (this.nextRetryTime && new Date() >= this.nextRetryTime) {
                this.state = 'HALF_OPEN';
                this.halfOpenCalls = 0;
                logger.info(`Circuit ${this.name} → HALF_OPEN`);
                return true;
            }
            return false;
        }

        // HALF_OPEN
        return this.halfOpenCalls < this.options.halfOpenMaxCalls;
    }

    private onSuccess(): void {
        this.successes++;
        if (this.state === 'HALF_OPEN') {
            this.halfOpenCalls++;
            if (this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
                this.state = 'CLOSED';
                this.failures = 0;
                logger.info(`Circuit ${this.name} → CLOSED (recovered)`);
            }
        }
    }

    private onFailure(): void {
        this.failures++;
        this.totalFailures++;
        this.lastFailureTime = new Date();

        if (this.state === 'HALF_OPEN') {
            this.trip();
            return;
        }

        if (this.failures >= this.options.failureThreshold) {
            this.trip();
        }
    }

    private trip(): void {
        this.state = 'OPEN';
        this.nextRetryTime = new Date(Date.now() + this.options.resetTimeoutMs);
        logger.warn(`Circuit ${this.name} → OPEN (tripped after ${this.failures} failures)`);
    }

    getStats(): CircuitStats {
        return {
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            lastFailure: this.lastFailureTime,
            totalRequests: this.totalRequests,
            totalFailures: this.totalFailures,
        };
    }

    reset(): void {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.halfOpenCalls = 0;
        logger.info(`Circuit ${this.name} manually reset`);
    }
}

// Pre-configured circuit breakers for common services
export const circuits = {
    vastai: new CircuitBreaker('vast.ai', { ...DEFAULT_OPTIONS, failureThreshold: 3 }),
    runpod: new CircuitBreaker('runpod', { ...DEFAULT_OPTIONS, failureThreshold: 3 }),
    stripe: new CircuitBreaker('stripe', { ...DEFAULT_OPTIONS, failureThreshold: 5, resetTimeoutMs: 60000 }),
    s3: new CircuitBreaker('s3-storage', DEFAULT_OPTIONS),
};

export { CircuitBreaker };
