/**
 * Role Mining UI - Server Entry Point
 *
 * Validates configuration and starts Express server
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const validateConfiguration = require('./utils/validateConfig');

async function startServer() {
    try {
        // Validate configuration before starting
        await validateConfiguration();

        const port = config.port;

        app.listen(port, () => {
            logger.info('🚀 Role Mining UI Server started');
            logger.info(`   Port: ${port}`);
            logger.info(`   Environment: ${config.nodeEnv}`);
            logger.info(`   Flask Backend: ${config.flaskApiUrl}`);
            logger.info(`   CORS Origin: ${config.corsOrigin}`);
            logger.info('');
            logger.info('📝 Logs are written to:');
            logger.info(`   - logs/combined.log (all logs)`);
            logger.info(`   - logs/error.log (errors only)`);
            logger.info('');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();