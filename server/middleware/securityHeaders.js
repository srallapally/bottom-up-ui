/**
 * Basic security headers (Helmet-like) + CSP.
 *
 * Kept dependency-free to avoid introducing new npm packages in this repo.
 * Configure via:
 *  - NODE_ENV=production|development
 *  Fixing merge mistake
 */
module.exports = function securityHeaders() {
    return (req, res, next) => {
        const isProd = process.env.NODE_ENV === 'production';

        // Basic hardening headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Allow Google Identity popups while still protecting most cross-origin isolation edge cases
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

        // Content Security Policy
        // NOTE: Vite dev server needs 'unsafe-eval' and ws:// connect-src for HMR.
        const scriptSrc = [
            "'self'",
            "https://accounts.google.com/gsi/client",
            "https://accounts.google.com",
            "https://www.gstatic.com"
        ];

        const connectSrc = [
            "'self'",
            "https://accounts.google.com",
            "https://www.googleapis.com"
        ];

        const frameSrc = [
            "https://accounts.google.com"
        ];

        if (!isProd) {
            scriptSrc.push("'unsafe-eval'");
            // Dev tooling / HMR
            connectSrc.push("http://localhost:*", "ws://localhost:*");
        }

        const cspDirectives = [
            `default-src 'self'`,
            `base-uri 'self'`,
            `object-src 'none'`,
            `frame-ancestors 'none'`,
            `img-src 'self' data: https:`,
            `script-src ${scriptSrc.join(' ')}`,
            `style-src 'self' 'unsafe-inline'`,
            `connect-src ${connectSrc.join(' ')}`,
            `frame-src ${frameSrc.join(' ')}`,
            `form-action 'self'`
        ];

        res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

        next();
    };
};
