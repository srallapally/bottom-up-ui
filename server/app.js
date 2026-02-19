/**
 * Role Mining UI - Express Application
 *
 * Configures middleware, session, passport, and routes
 */

const express = require('express');
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


// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow frontend origin
app.use(cors({
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
}));
app.options(/.*/, cors());


// ============================================================================
// RATE LIMITING (basic per-instance safety net)
// ============================================================================

const authRateLimitMaxPerMin = parseInt(process.env.AUTH_RATE_LIMIT_PER_MIN || '30', 10);
const apiRateLimitMaxPerMin = parseInt(process.env.API_RATE_LIMIT_PER_MIN || '300', 10);

app.use('/auth', rateLimiter({ windowMs: 60 * 1000, max: authRateLimitMaxPerMin }));
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

app.use(session({
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

// Root redirect
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

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