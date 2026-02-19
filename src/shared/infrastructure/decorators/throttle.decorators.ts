import { Throttle } from '@nestjs/throttler';

// Each factory returns a MethodDecorator and ClassDecorator
// the same return type as @Throttle() itself

/**
 * Generous limits for GET endpoints (read operations).
 * 20 req/sec burst, 200 req/min sustained.
 */
export const ThrottleRead = () =>
    Throttle({
        short: {
            ttl: 1000,
            limit: 20,
        },
        long: {
            ttl: 60000,
            limit: 200,
        },
    });

/**
 * Moderate limits for POST endpoints (create operations).
 * 5 req/sec burst, 50 req/min sustained.
 */
export const ThrottleWrite = () =>
    Throttle({
        short: {
            ttl: 1000,
            limit: 5,
        },
        long: {
            ttl: 60000,
            limit: 50,
        },
    });

/**
 * Moderate limits for PATCH/PUT endpoints (update operations).
 * 5 req/sec burst, 50 req/min sustained.
 */
export const ThrottleUpdate = () =>
    Throttle({
        short: { ttl: 1000, limit: 5 },
        long: { ttl: 60000, limit: 50 },
    });

/**
 * Strict limits for DELETE endpoints (destructive operations).
 * 3 req/sec burst, 30 req/min sustained.
 */
export const ThrottleDelete = () =>
    Throttle({
        short: { ttl: 1000, limit: 3 },
        long: { ttl: 60000, limit: 30 },
    });
