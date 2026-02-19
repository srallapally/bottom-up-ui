// server/config/index.js
require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Flask Backend - NO HARDCODING
    flaskApiUrl: process.env.FLASK_API_URL,

    // Ping OIDC
    ping: {
        issuer: process.env.PING_ISSUER,
        clientId: process.env.PING_CLIENT_ID,
        callbackUrl: process.env.PING_CALLBACK_URL,
    },

    // Session
    session: {
        secret: process.env.SESSION_SECRET,
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Google OIDC (GIS ID token)
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN, // optional, but recommended
    },

    // Proxy (Node -> Flask)
    proxy: {
        timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS || '30000', 10),
        proxyTimeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS || '30000', 10),
    },


    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
};

// Validation: Critical configs must be set
// NOTE: This repo currently supports either Ping OIDC or Google ID token auth.
// If GOOGLE_CLIENT_ID is set, we validate Google settings and do NOT require Ping vars.
// Otherwise, we keep the existing Ping-required behavior.
const usingGoogle = !!process.env.GOOGLE_CLIENT_ID;

const requiredEnvVars = usingGoogle
    ? ['FLASK_API_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID']
    : ['FLASK_API_URL', 'PING_ISSUER', 'PING_CLIENT_ID', 'SESSION_SECRET'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env file');
    process.exit(1);
}

// Validate Flask URL format
try {
    new URL(config.flaskApiUrl);
} catch (error) {
    console.error('❌ Invalid FLASK_API_URL:', config.flaskApiUrl);
    console.error('Must be a valid URL (e.g., http://localhost:5000 or https://api.example.com)');
    process.exit(1);
}

console.log('✅ Configuration loaded:');
console.log(`   Flask API: ${config.flaskApiUrl}`);
console.log(`   CORS Origin: ${config.corsOrigin}`);
console.log(`   Environment: ${config.nodeEnv}`);

module.exports = config;