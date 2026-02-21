const axios = require('axios');
const config = require('../config/index');
const logger = require('../utils/logger');

function missing(vars) {
    return vars.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
}

async function validateConfig() {
    const requiredAlways = ['FLASK_API_URL', 'SESSION_SECRET'];

    // If GOOGLE_CLIENT_ID is set, we use Google GIS and do NOT require Ping env vars.
    const usingGoogle = !!(process.env.GOOGLE_CLIENT_ID && String(process.env.GOOGLE_CLIENT_ID).trim());

    const requiredAuthVars =  ['GOOGLE_CLIENT_ID']; // hosted domain is optional

    const required = [...requiredAlways, ...requiredAuthVars];
    const missingVars = missing(required);

    if (missingVars.length > 0) {
        logger.error(`❌ Missing required environment variables: ${missingVars}`);
        logger.error(`Please check your .env file`);
        process.exit(1);
    }

    // Reachability check
    try {
        // Backend health endpoint (best validation for your stack)
        await axios.get(`${config.flaskApiUrl}/api/health`, { timeout: 5000 });
        logger.info(`✅ Flask backend reachable at ${config.flaskApiUrl}`);
    } catch (error) {
        logger.error(`❌ Cannot reach Flask backend at ${config.flaskApiUrl}`);
        logger.error(`   Error: ${error.message}`);
    }

    // Auth provider reachability check (optional, but helpful)
    if (!usingGoogle) {
        try {
            await axios.get(`${config.ping.issuer}/.well-known/openid-configuration`, { timeout: 5000 });
            logger.info(`✅ Ping OIDC issuer reachable`);
        } catch (error) {
            logger.error(`❌ Cannot reach Ping OIDC issuer at ${config.ping.issuer}`);
            logger.error(`   Error: ${error.message}`);
        }
    } else {
        logger.info(`✅ Google GIS enabled (GOOGLE_CLIENT_ID set); skipping Ping OIDC issuer checks`);
    }
}

module.exports = validateConfig;