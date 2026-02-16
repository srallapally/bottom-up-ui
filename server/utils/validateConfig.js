// server/utils/validateConfig.js
const config = require('../config');
const axios = require('axios');
const logger = require('./logger');

async function validateConfiguration() {
    logger.info('🔍 Validating configuration...');

    // 1. Check Flask backend connectivity
    try {
        const { data } = await axios.get(`${config.flaskApiUrl}/api/health`, {
            timeout: 5000
        });

        if (data.status === 'ok') {
            logger.info(`✅ Flask backend reachable at ${config.flaskApiUrl}`);
        } else {
            logger.warn(`⚠️  Flask backend responded but status is not "ok": ${data.status}`);
        }
    } catch (error) {
        logger.error(`❌ Cannot reach Flask backend at ${config.flaskApiUrl}`);
        logger.error(`   Error: ${error.message}`);
        logger.error('   Please check:');
        logger.error('   1. FLASK_API_URL in .env is correct');
        logger.error('   2. Flask server is running');
        logger.error('   3. Network/firewall allows connection');

        if (config.nodeEnv === 'production') {
            logger.error('   Exiting due to backend unavailability in production');
            process.exit(1);
        } else {
            logger.warn('   Continuing anyway (development mode)');
        }
    }

    // 2. Check Ping OIDC issuer
    try {
        await axios.get(`${config.ping.issuer}/.well-known/openid-configuration`, {
            timeout: 5000
        });
        logger.info(`✅ Ping OIDC issuer reachable`);
    } catch (error) {
        logger.error(`❌ Cannot reach Ping OIDC issuer at ${config.ping.issuer}`);
        logger.error(`   Error: ${error.message}`);
    }

    // 3. Validate session directory exists
    const fs = require('fs');
    const sessionDir = require('path').join(__dirname, '../../data');
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
        logger.info(`✅ Created session directory at ${sessionDir}`);
    } else {
        logger.info(`✅ Session directory exists at ${sessionDir}`);
    }

    logger.info('✅ Configuration validation complete\n');
}

module.exports = validateConfiguration;