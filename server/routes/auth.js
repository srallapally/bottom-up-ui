/**
 * Role Mining UI - Authentication Routes
 *
 * Handles OAuth2 PKCE flow with direct HTTP calls (no Passport.js)
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');
const config = require('../config');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// PKCE HELPER FUNCTIONS
// ============================================================================

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function generateCodeVerifier() {
    return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
    return base64URLEncode(sha256(verifier));
}

function generateState() {
    return base64URLEncode(crypto.randomBytes(16));
}

// ============================================================================
// LOGIN
// ============================================================================

router.get('/login', (req, res) => {
    logger.info('User initiating login', {
        sessionID: req.sessionID
    });

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store in session
    req.session.code_verifier = codeVerifier;
    req.session.state = state;

    logger.info('Generated PKCE parameters', {
        verifier: codeVerifier.substring(0, 10) + '...',
        challenge: codeChallenge.substring(0, 10) + '...',
        state: state.substring(0, 10) + '...'
    });

    // Build authorization URL
    const authParams = {
        response_type: 'code',
        client_id: config.ping.clientId,
        redirect_uri: config.ping.callbackUrl,
        scope: 'openid profile email',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    };

    const authUrl = `${config.ping.issuer}/authorize?${querystring.stringify(authParams)}`;

    logger.info('Redirecting to authorization endpoint', {
        authURL: authUrl.substring(0, 100) + '...',
        params: authParams
    });

    res.redirect(authUrl);
});

// ============================================================================
// CALLBACK
// ============================================================================

router.get('/callback', async (req, res) => {
    logger.info('OAuth2 callback received', {
        hasCode: !!req.query.code,
        hasState: !!req.query.state,
        hasError: !!req.query.error,
        error: req.query.error,
        error_description: req.query.error_description
    });

    // Check for errors
    if (req.query.error) {
        logger.error('OAuth2 error in callback', {
            error: req.query.error,
            description: req.query.error_description
        });
        return res.status(400).json({
            error: req.query.error,
            description: req.query.error_description
        });
    }

    // Validate state
    if (req.query.state !== req.session.state) {
        logger.error('State mismatch', {
            received: req.query.state,
            expected: req.session.state
        });
        return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const code = req.query.code;
    const codeVerifier = req.session.code_verifier;

    if (!code) {
        logger.error('No authorization code received');
        return res.status(400).json({ error: 'No authorization code' });
    }

    if (!codeVerifier) {
        logger.error('No code verifier in session');
        return res.status(400).json({ error: 'No code verifier in session' });
    }

    try {
        // Exchange code for token
        logger.info('Exchanging authorization code for token', {
            tokenURL: `${config.ping.issuer}/access_token`,
            code: code.substring(0, 10) + '...',
            verifier: codeVerifier.substring(0, 10) + '...'
        });

        const tokenParams = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.ping.callbackUrl,
            client_id: config.ping.clientId,
            code_verifier: codeVerifier
        };

        logger.info('Token request params', {
            grant_type: tokenParams.grant_type,
            client_id: tokenParams.client_id,
            redirect_uri: tokenParams.redirect_uri,
            has_code: !!tokenParams.code,
            has_code_verifier: !!tokenParams.code_verifier
        });

        const tokenResponse = await axios.post(
            `${config.ping.issuer}/access_token`,
            querystring.stringify(tokenParams),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        logger.info('Token response received', {
            hasAccessToken: !!tokenResponse.data.access_token,
            hasRefreshToken: !!tokenResponse.data.refresh_token,
            tokenType: tokenResponse.data.token_type
        });

        const accessToken = tokenResponse.data.access_token;

        // Fetch user info
        logger.info('Fetching user info', {
            userInfoURL: `${config.ping.issuer}/userinfo`
        });

        const userInfoResponse = await axios.get(
            `${config.ping.issuer}/userinfo`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        logger.info('User info received', {
            sub: userInfoResponse.data.sub,
            email: userInfoResponse.data.email,
            name: userInfoResponse.data.name
        });

        // Create user object
        const user = {
            id: userInfoResponse.data.sub,
            email: userInfoResponse.data.email || '',
            displayName: userInfoResponse.data.name || userInfoResponse.data.preferred_username || 'User',
            accessToken: accessToken
        };

        // Store user in session
        req.session.user = user;

        // Clear PKCE data
        delete req.session.code_verifier;
        delete req.session.state;

        logger.info('Authentication successful', {
            userId: user.id,
            email: user.email
        });

        // Redirect to frontend dashboard
        const dashboardUrl = `${config.corsOrigin}/dashboard`;
        res.redirect(dashboardUrl);

    } catch (error) {
        logger.error('Token exchange failed', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({
            error: 'Authentication failed',
            message: error.message,
            details: error.response?.data
        });
    }
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

router.get('/session', (req, res) => {
    // TEMPORARY: Create mock user if not exists (auth disabled)
    if (!req.session.user) {
        req.session.user = {
            id: 'mock-user-123',
            email: 'mock@example.com',
            displayName: 'Mock User'
        };
        logger.info('Created mock user session (auth disabled)');
    }

    res.json({
        authenticated: true,
        user: {
            id: req.session.user.id,
            email: req.session.user.email,
            displayName: req.session.user.displayName
        }
    });
});

module.exports = router;