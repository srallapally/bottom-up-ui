/**
 * Role Mining UI - Passport Configuration
 *
 * Configures Passport.js with OAuth2 strategy for ForgeRock authentication with PKCE
 */

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const crypto = require('crypto');
const axios = require('axios');
const config = require('./index');
const logger = require('../utils/logger');

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

// ============================================================================
// CUSTOM OAUTH2 STRATEGY WITH PKCE
// ============================================================================

class PKCEStrategy extends OAuth2Strategy {
    authenticate(req, options) {
        logger.info('PKCEStrategy.authenticate called', {
            hasCode: !!req.query.code,
            hasVerifierInSession: !!req.session.code_verifier,
            query: req.query
        });

        // Generate PKCE parameters if not in callback
        if (!req.query.code && !req.session.code_verifier) {
            const verifier = generateCodeVerifier();
            const challenge = generateCodeChallenge(verifier);

            logger.info('Generated PKCE parameters', {
                verifier: verifier.substring(0, 10) + '...',
                challenge: challenge.substring(0, 10) + '...',
                challenge_method: 'S256'
            });

            req.session.code_verifier = verifier;
            this._verifier = verifier;

            // Add PKCE parameters to authorization request
            options = options || {};
            options.code_challenge = challenge;
            options.code_challenge_method = 'S256';

            logger.info('Redirecting to authorization endpoint', {
                authURL: `${config.ping.issuer}/authorize`,
                client_id: config.ping.clientId,
                redirect_uri: config.ping.callbackUrl,
                code_challenge: challenge
            });
        }

        // In callback, retrieve verifier from session
        if (req.session.code_verifier) {
            logger.info('Retrieved code_verifier from session', {
                verifier: req.session.code_verifier
            });
            this._verifier = req.session.code_verifier;
        }

        super.authenticate(req, options);
    }

    tokenParams(options) {
        const params = super.tokenParams(options);

        logger.info('Building token request params', {
            hasVerifier: !!this._verifier,
            verifier: this._verifier ? this._verifier: null,
            paramsKeys: Object.keys(params)
        });

        // Add code_verifier to token request
        if (this._verifier) {
            params.code_verifier = this._verifier;
        }

        // Remove client_secret from params (PKCE uses public client)
        delete params.client_secret;

        logger.info('Final token params', {
            grant_type: params.grant_type,
            client_id: params.client_id,
            redirect_uri: params.redirect_uri,
            has_code: !!params.code,
            has_code_verifier: !!params.code_verifier,
            code_verifier: params.code_verifier ? params.code_verifier: null
        });

        return params;
    }
}

passport.use('oauth2', new PKCEStrategy({
        authorizationURL: `${config.ping.issuer}/authorize`,
        tokenURL: `${config.ping.issuer}/access_token`,
        clientID: config.ping.clientId,
        callbackURL: config.ping.callbackUrl,
        scope: ['openid', 'profile', 'email'],
        state: true,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, params, profile, done) => {
        try {
            logger.info('OAuth2 callback received', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                paramsKeys: Object.keys(params || {}),
                accessToken: accessToken ? accessToken : null
            });

            // Clear code_verifier from session
            delete req.session.code_verifier;

            logger.info('Fetching user info', {
                userInfoURL: `${config.ping.issuer}/userinfo`
            });

            // Fetch user info from userinfo endpoint
            const { data } = await axios.get(`${config.ping.issuer}/userinfo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            logger.info('User info received', {
                sub: data.sub,
                email: data.email,
                name: data.name
            });

            // Extract user info
            const user = {
                id: data.sub,
                email: data.email || '',
                displayName: data.name || data.preferred_username || 'User',
                raw: data
            };

            logger.info('OAuth2 authentication successful', {
                userId: user.id,
                email: user.email
            });

            return done(null, user);
        } catch (error) {
            logger.error('Failed to fetch user info', {
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            return done(error);
        }
    }
));

// ============================================================================
// SESSION SERIALIZATION
// ============================================================================

// Serialize user to session (store minimal data)
passport.serializeUser((user, done) => {
    logger.debug('Serializing user to session', { userId: user.id });
    done(null, {
        id: user.id,
        email: user.email,
        displayName: user.displayName
    });
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    logger.debug('Deserializing user from session', { userId: user.id });
    done(null, user);
});

module.exports = passport;