/**
 * Role Mining UI - Express Application
 *
 * Configures middleware, session, passport, and routes
 * Fixing merge mistake
 *
 * NOTE (surgical fix):
 * - CORS is now applied ONLY to /auth and /api routes.
 *   This prevents static asset requests (e.g., /assets/*.js) from being blocked in single-origin production mode.
 * - Adds production static serving for built Vue SPA from server/client-dist (only when NODE_ENV=production).
 *
 * CSP Fix (surgical):
 * - Google Identity Services loads a stylesheet from https://accounts.google.com/gsi/style
 * - Our CSP (set by securityHeaders()) previously allowed only style-src 'self' 'unsafe-inline'
 * - Patch style-src to also allow https://accounts.google.com
 *
 * SESSION STORE FIX (production-grade):
 * - MemoryStore breaks on Cloud Run because instances don't share memory; requests can land on different instances.
 * - If REDIS_URL is set, use Redis (Memorystore) as a shared session store.
 * - If REDIS_URL is not set, fall back to MemoryStore (local dev).
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const securityHeaders = require('./middleware/securityHeaders');

// Route imports
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// If running behind a reverse proxy / load balancer (common in GCP), enable this so req.ip is correct.
if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
}

// Reduce fingerprinting
app.disable('x-powered-by');

// Baseline security headers + CSP
app.use(securityHeaders());

// CSP patch: allow Google Identity Services stylesheet host.
// This keeps the existing CSP intact and only adjusts style-src.
app.use((req, res, next) => {
    const csp = res.getHeader('Content-Security-Policy');
    if (!csp) return next();

    const cspStr = Array.isArray(csp) ? csp.join('; ') : String(csp);

    // If style-src is already present, append accounts.google.com if missing.
    // Otherwise, do nothing (securityHeaders() always sets it, but keep this safe).
    const styleSrcRegex = /(?:^|;\s*)style-src\s+([^;]+)/i;
    const match = cspStr.match(styleSrcRegex);

    if (!match) return next();

    const styleSrcValue = match[1] || '';
    const alreadyAllowed = /\bhttps:\/\/accounts\.google\.com\b/i.test(styleSrcValue);
    if (alreadyAllowed) return next();

    // Append the required origin
    const patched = cspStr.replace(styleSrcRegex, (full, value) => {
        const trimmed = (value || '').trim();
        return `; style-src ${trimmed} https://accounts.google.com`;
    });

    // Normalize possible leading semicolon introduced by replace
    res.setHeader('Content-Security-Policy', patched.replace(/^;\s*/, ''));
    next();
});


// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Apply ONLY to /auth and /api (do NOT apply to static assets)
const corsOptions = {
    origin: (origin, cb) => {
        // Comma-separated allowlist via env: CORS_ORIGINS=https://ui.example.com,https://staging-ui.example.com
        // Back-compat: CORS_ORIGIN may be a single origin.
        const raw = process.env.CORS_ORIGINS || config.corsOrigin || '';
        const allowlist = raw.split(',').map(s => s.trim()).filter(Boolean);

        // Non-browser clients (no Origin header)
        if (!origin) return cb(null, true);

        if (allowlist.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

app.use('/auth', cors(corsOptions));
app.use('/api', cors(corsOptions));
app.options(/^\/auth\/.*/, cors(corsOptions));
app.options(/^\/api\/.*/, cors(corsOptions));


// ============================================================================
// RATE LIMITING (basic per-instance safety net)
// ============================================================================

const authRateLimitMaxPerMin = parseInt(process.env.AUTH_RATE_LIMIT_PER_MIN || '30', 10);
const apiRateLimitMaxPerMin = parseInt(process.env.API_RATE_LIMIT_PER_MIN || '300', 10);

const authLimiter = rateLimiter({ windowMs: 60 * 1000, max: authRateLimitMaxPerMin });

app.use('/auth', (req, res, next) => {
    const p = req.path || '';

    // Exempt OAuth/session endpoints from throttling.
    // Otherwise the UI can self-trigger 429s during login/session checks.
    if (
        p === '/login' ||
        p === '/callback' ||
        p === '/session' ||
        p === '/logout'
    ) {
        return next();
    }

    return authLimiter(req, res, next);
});

app.use('/api', rateLimiter({ windowMs: 60 * 1000, max: apiRateLimitMaxPerMin }));


// Body parsing - skip for /api routes (proxied to Flask, need raw stream)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    express.json({ limit: process.env.REQUEST_BODY_LIMIT || '1mb' })(req, res, next);
});
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '1mb' })(req, res, next);
});

// Request logging
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
        query: req.query,
        user: req.user?.id
    });
    next();
});

// ============================================================================
// SESSION
// ============================================================================

// Shared session store (Redis) when REDIS_URL is provided; MemoryStore otherwise (dev).
let sessionStore = undefined;

if (process.env.REDIS_URL) {
    // Lazy-require so local dev doesn't need these deps installed unless you want them.
    const { RedisStore } = require('connect-redis');
    const { createClient } = require('redis');

    const redisUrl = process.env.REDIS_URL;

    const redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
        logger.error('Redis client error', { err: err?.message || err });
    });

    // Connect in the background. If it fails, hard-fail to avoid silent auth/session corruption.
    redisClient.connect().then(() => {
        logger.info('Connected to Redis for session store');
    }).catch((err) => {
        logger.error('Failed to connect to Redis (REDIS_URL)', { err: err?.message || err });
        process.exit(1);
    });

    sessionStore = new RedisStore({ client: redisClient });
    logger.info('Session store: Redis (REDIS_URL is set)');
} else {
    logger.info('Session store: MemoryStore (REDIS_URL not set)');
}

app.use(session({
    store: sessionStore,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: config.session.maxAge,
        httpOnly: true,
        secure: config.nodeEnv === 'production', // HTTPS only in production
        sameSite: 'lax'
    }
}));

// ============================================================================
// ROUTES
// ============================================================================

// Auth routes (login, callback, logout)
app.use('/auth', authRoutes);

// API routes (proxy to Flask + session management)
app.use('/api', apiRoutes);

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'role-mining-ui',
        timestamp: new Date().toISOString()
    });
});

// Root redirect (dev only)
// In production, let the SPA static handler serve "/"
app.get('/', (req, res, next) => {
    if (config.nodeEnv === 'production') {
        return next();
    }

    if (req.isAuthenticated && req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// ============================================================================
// STATIC UI (production only)
// ============================================================================

if (config.nodeEnv === 'production') {
    // In the Docker image, copy client/dist -> server/client-dist
    const staticDir = path.join(__dirname, 'client-dist');

    // Serve built assets (e.g., /assets/*.js, /favicon.ico)
    app.use(express.static(staticDir));

    // SPA fallback: serve index.html for non-API/auth/health routes
    app.get(/^\/(?!api\/|auth\/|health).*/, (req, res) => {
        res.sendFile(path.join(staticDir, 'index.html'));
    });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found', { path: req.path });
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack })
    });
});

module.exports = app;