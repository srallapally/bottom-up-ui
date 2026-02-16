// server/middleware/sessionEnforcer.js
const sessionTracker = require('../services/sessionTracker');
const logger = require('../utils/logger');

async function enforceOneSession(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    // Only enforce on session creation
    if (req.path === '/api/sessions' && req.method === 'POST') {
        const existingSession = await sessionTracker.getUserSession(userId);

        if (existingSession) {
            logger.warn('User attempted to create second session', {
                userId,
                existingSessionId: existingSession.session_id
            });

            return res.status(409).json({
                error: 'Active session exists',
                session: existingSession
            });
        }
    }

    next();
}

module.exports = enforceOneSession;