// server/routes/auth.js
/**
 * Role Mining UI - Auth Routes
 *
 * Currently using mock authentication (ForgeRock OAuth disabled)
 */

const express = require('express');
const config = require('../config');
const logger = require('../utils/logger');
const sessionTracker = require('../services/sessionTracker');

const router = express.Router();

// ============================================================================
// LOGIN (Currently disabled - mock auth active)
// ============================================================================

router.get('/login', (req, res) => {
    logger.info('Login requested (auth disabled, using mock user)');
    res.redirect(`${config.corsOrigin}/dashboard`);
});

// ============================================================================
// CALLBACK (Currently disabled)
// ============================================================================

router.get('/callback', (req, res) => {
    logger.info('Callback hit (auth disabled)');
    res.redirect(`${config.corsOrigin}/dashboard`);
});

// ============================================================================
// LOGOUT
// ============================================================================

router.get('/logout', (req, res) => {
    const userId = req.session.user?.id;

    req.session.destroy((err) => {
        if (err) {
            logger.error('Session destruction error', { error: err.message });
        } else {
            logger.info('User logged out', { userId });
        }

        res.redirect(`${config.corsOrigin}/`);
    });
});

// ============================================================================
// SESSION INFO
// ============================================================================

router.get('/session', async (req, res) => {
    // TEMPORARY: Create mock user if not exists (auth disabled)
    if (!req.session.user) {
        req.session.user = {
            id: 'mock-user-123',
            email: 'mock@example.com',
            displayName: 'Mock User'
        };
        logger.info('Created mock user session (auth disabled)');
    }

    // Look up mining session from CSV tracker
    let miningSessionId = null;
    try {
        const existing = await sessionTracker.getUserSession(req.session.user.id);
        if (existing && existing.status === 'active') {
            miningSessionId = existing.session_id;
        }
    } catch (err) {
        logger.warn('Failed to look up mining session', { error: err.message });
    }

    res.json({
        authenticated: true,
        user: {
            id: req.session.user.id,
            email: req.session.user.email,
            displayName: req.session.user.displayName
        },
        miningSessionId
    });
});

module.exports = router;