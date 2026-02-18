/**
 * Role Mining UI - API Routes
 *
 * Proxy to Flask backend + session management
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const sessionTracker = require('../services/sessionTracker');

const router = express.Router();

// ============================================================================
// MIDDLEWARE: Require Authentication
// ============================================================================

function requireAuth(req, res, next) {
    // Require a bearer token from the client (Google ID token)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }

    // Keep existing session.user shape for downstream code (sessionTracker + logs)
    // Minimal: we don't verify token here; Flask does. This just ensures it exists.
    if (!req.session.user) {
        req.session.user = {
            id: 'unknown',          // optional placeholder; not used for auth
            email: 'unknown',       // optional placeholder
            displayName: 'User'
        };
    }

    next();
}

// ============================================================================
// MIDDLEWARE: Inject User Context
// ============================================================================

function injectUserContext(req, res, next) {
    // Keep existing headers if other parts rely on them.
    // NOTE: Auth is done via Authorization header passthrough.
    if (req.session.user) {
        req.headers['x-user-id'] = req.session.user.id;
        req.headers['x-user-email'] = req.session.user.email;

        logger.debug('Injected user context', {
            userId: req.session.user.id,
            path: req.path
        });
    }
    next();
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

// Health check (includes Flask backend status)
router.get('/health', async (req, res) => {
    try {
        const { data } = await axios.get(`${config.flaskApiUrl}/api/health`, {
            timeout: 5000
        });

        res.json({
            express: 'ok',
            flask: data,
            flaskUrl: config.flaskApiUrl,
            authenticated: !!req.session.user,
            user: req.session.user ? { id: req.session.user.id, email: req.session.user.email } : null
        });
    } catch (error) {
        logger.error('Flask health check failed', {
            url: config.flaskApiUrl,
            error: error.message
        });

        res.status(503).json({
            express: 'ok',
            flask: 'unavailable',
            error: error.message,
            flaskUrl: config.flaskApiUrl
        });
    }
});

// ============================================================================
// SESSION ENFORCEMENT
// ============================================================================

// Previously enforced: 1 user = 1 session.
// New requirement: a logged-in user can have MANY sessions.
// So this route no longer blocks session creation.
router.post('/sessions', requireAuth, async (req, res, next) => {
    next();
});

// ============================================================================
// PROXY TO FLASK
// ============================================================================

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(injectUserContext);

// Proxy all requests to Flask backend
router.use(createProxyMiddleware({
    target: config.flaskApiUrl,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/' // Keep /api prefix
    },

    onProxyReq: (proxyReq, req, res) => {
        // CRITICAL: Forward the Authorization header to Flask.
        // Without this, Flask interceptor returns 401 "Missing bearer token".
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader) {
            proxyReq.setHeader('Authorization', authHeader);
        }

        logger.debug('Proxying request to Flask', {
            method: req.method,
            path: req.path,
            target: `${config.flaskApiUrl}${req.path}`,
            user: req.session.user?.id
        });
    },

    onProxyRes: (proxyRes, req, res) => {
        // Track session creation
        if (req.method === 'POST' && req.path === '/sessions' && proxyRes.statusCode === 201) {
            let body = '';

            proxyRes.on('data', chunk => {
                body += chunk;
            });

            proxyRes.on('end', async () => {
                try {
                    const data = JSON.parse(body);

                    // Track in CSV
                    await sessionTracker.createSession(
                        req.session.user.id,
                        data.session_id,
                        req.session.user.email
                    );

                    logger.info('Session tracked successfully', {
                        userId: req.session.user.id,
                        sessionId: data.session_id
                    });
                } catch (err) {
                    logger.error('Failed to track session', {
                        userId: req.session.user?.id,
                        error: err.message
                    });
                }
            });
        }
    },

    onError: (err, req, res) => {
        logger.error('Proxy error', {
            target: config.flaskApiUrl,
            path: req.path,
            method: req.method,
            error: err.message,
            code: err.code
        });

        // Send user-friendly error
        res.status(502).json({
            error: 'Backend unavailable',
            message: 'Unable to connect to Flask backend',
            details: err.message,
            target: config.flaskApiUrl
        });
    }
}));

module.exports = router;
