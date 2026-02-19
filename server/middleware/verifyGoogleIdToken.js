// server/middleware/verifyGoogleIdToken.js
/**
 * Verify a Google Identity Services (GIS) ID token.
 *
 * Why this exists:
 * - Client-side checks (e.g., payload.hd) are not security controls.
 * - The server must validate the ID token before treating the request as authenticated.
 *
 * Implementation note:
 * - To keep this repo dependency-light, we validate via Google's tokeninfo endpoint.
 * - This adds a network call per request; in production you should add caching and/or
 *   switch to offline verification via JWKS.
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

async function verifyGoogleIdToken(idToken) {
    const { data } = await axios.get(TOKENINFO_URL, {
        params: { id_token: idToken },
        timeout: 5000,
        // tokeninfo returns 400 for invalid tokens
        validateStatus: (s) => (s >= 200 && s < 300) || s === 400
    });

    // Invalid token
    if (!data || data.error_description || data.error) {
        const msg = data?.error_description || data?.error || 'Invalid ID token';
        const err = new Error(msg);
        err.code = 'INVALID_TOKEN';
        throw err;
    }

    // Validate audience (client_id)
    const expectedAud = config.google?.clientId;
    if (expectedAud && data.aud !== expectedAud) {
        const err = new Error(`Invalid audience (aud=${data.aud})`);
        err.code = 'INVALID_AUD';
        throw err;
    }

    // Validate hosted domain, if configured
    const expectedHd = config.google?.hostedDomain;
    if (expectedHd && data.hd !== expectedHd) {
        const err = new Error(`Invalid hosted domain (hd=${data.hd})`);
        err.code = 'INVALID_HD';
        throw err;
    }

    // Require verified email when present
    if (String(data.email_verified || '').toLowerCase() === 'false') {
        const err = new Error('Email not verified');
        err.code = 'EMAIL_NOT_VERIFIED';
        throw err;
    }

    return data;
}

// Express middleware
module.exports = async function verifyGoogleIdTokenMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }

    const idToken = authHeader.slice('Bearer '.length).trim();
    if (!idToken) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }

    try {
        const payload = await verifyGoogleIdToken(idToken);

        // Map Google tokeninfo response to our user shape
        const user = {
            id: payload.sub,
            email: payload.email,
            displayName: payload.name || payload.email || 'User',
            hd: payload.hd
        };

        req.user = user;

        // Keep existing session.user shape for downstream code
        req.session.user = {
            id: user.id,
            email: user.email,
            displayName: user.displayName
        };

        return next();
    } catch (err) {
        logger.warn('Google ID token verification failed', {
            code: err.code,
            message: err.message,
            path: req.path
        });
        return res.status(401).json({ error: 'Invalid bearer token' });
    }
};
