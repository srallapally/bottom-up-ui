// server/routes/auth.js
/**
 * Role Mining UI - Auth Routes
 *
 * Google login (GIS) is handled client-side.
 * The server establishes an authenticated session by verifying the Google ID token
 * and then issuing an HttpOnly session cookie (BFF pattern).
 */

const express = require('express');
const config = require('../config');
const logger = require('../utils/logger');
const sessionTracker = require('../services/sessionTracker');
const verifyGoogleIdToken = require('../middleware/verifyGoogleIdToken');

const router = express.Router();

// ============================================================================
// LOGIN (Exchange Google ID token for a server session)
// ============================================================================

router.post('/login', verifyGoogleIdToken, (req, res) => {
    // verifyGoogleIdToken populates req.session.user
    const user = req.session.user;

    // Rotate session id on login to reduce session fixation risk
    req.session.regenerate((err) => {
        if (err) {
            logger.error('Session regenerate failed', { error: err.message });
            return res.status(500).json({ error: 'Failed to create session' });
        }

        req.session.user = user;

        logger.info('User logged in', { userId: user.id, email: user.email });
        return res.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName
            }
        });
    });
});

// ============================================================================
// LOGOUT
// ============================================================================

router.post('/logout', (req, res) => {
    const userId = req.session.user?.id;

    req.session.destroy((err) => {
        if (err) {
            logger.error('Session destruction error', { error: err.message });
            return res.status(500).json({ error: 'Failed to logout' });
        }

        logger.info('User logged out', { userId });
        return res.json({ ok: true });
    });
});

// Back-compat: keep GET /logout for older flows
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
    if (!req.session.user) {
        return res.status(401).json({ authenticated: false });
    }

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
