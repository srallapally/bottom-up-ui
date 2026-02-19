// server/utils/logger.js
const winston = require('winston');
const path = require('path');

function redactSensitive(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) return obj.map(redactSensitive);

    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        const key = String(k).toLowerCase();

        // Common sensitive keys
        if (key.includes('authorization') || key.includes('cookie') || key.includes('set-cookie') || key.includes('token')) {
            out[k] = '[REDACTED]';
            continue;
        }

        out[k] = redactSensitive(v);
    }
    return out;
}

const redactFormat = winston.format((info) => {
    // Redact known sensitive fields in meta payloads
    const { ...copy } = info;

    // Redact headers if present
    if (copy.headers && typeof copy.headers === 'object') {
        copy.headers = redactSensitive(copy.headers);
    }

    // Redact any nested structures
    for (const k of Object.keys(copy)) {
        if (k === 'level' || k === 'message' || k === 'timestamp') continue;
        copy[k] = redactSensitive(copy[k]);
    }

    return copy;
});


const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        redactFormat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'role-mining-ui' },
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        // All logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        }),
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${
                        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                    }`;
                })
            )
        })
    ]
});

module.exports = logger;