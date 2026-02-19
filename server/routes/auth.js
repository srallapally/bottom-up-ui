// server/routes/auth.js
/**
 * Role Mining UI - Auth Routes
 *
 * Google login (GIS) is handled client-side.
 * Server-side authentication is enforced by verifying the Google ID token.
 */

const express = require('express');
const config = require('../config');
const logger = require('../utils/logger');
const sessionTracker = require('../services/sessionTracker');
const verifyGoogleIdToken = require('../middleware/verifyGoogleIdToken');

const router = express.Router();

// ============================================================================
// LOGIN (Currently disabled - mock auth active)
// ============================================================================

router.get('/login', (req, res) => {
    // Login UI lives in the SPA
    logger.info('Login requested');
    res.redirect(`${config.corsOrigin}/login`);
});

// ============================================================================
// CALLBACK (Currently disabled)
// ============================================================================

router.get('/callback', (req, res) => {
    // Not used for GIS button flow; kept for compatibility
    logger.info('Callback hit');
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

router.get('/session', verifyGoogleIdToken, async (req, res) => {
    // Look up mining session from CSV tracker
    let miningSessionId = null;
    try {
        const existing = await sessionTracker.getUserSession(req.session.user.id);
        if (existing) {
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