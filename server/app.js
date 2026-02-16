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

// Route imports
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow frontend origin
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

// Body parsing - skip for /api routes (proxied to Flask, need raw stream)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    express.json()(req, res, next);
});
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
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