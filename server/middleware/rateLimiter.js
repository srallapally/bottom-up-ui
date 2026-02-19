/**
 * Simple in-memory rate limiter (no external deps).
 *
 * NOTE: In multi-instance deployments, use an edge/WAF limiter (e.g., Cloud Armor)
 * and/or a shared store (e.g., Redis). This limiter is still valuable as a per-instance
 * safety net and to reduce accidental abuse.
 * This doesn't replace a real WAF, but it's a good first step.
 */
function rateLimiter({ windowMs, max, keyGenerator }) {
    if (!windowMs || !max) {
        throw new Error('rateLimiter requires windowMs and max');
    }

    const keyFn = keyGenerator || ((req) => req.ip || 'unknown');
    const buckets = new Map();

    return function limiter(req, res, next) {
        const now = Date.now();
        const key = keyFn(req);

        let bucket = buckets.get(key);
        if (!bucket || now > bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;

        // Basic informative headers (best-effort)
        const remaining = Math.max(0, max - bucket.count);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)));

        if (bucket.count > max) {
            res.status(429).json({ error: 'Too Many Requests' });
            return;
        }

        next();
    };
}

module.exports = rateLimiter;
