const winston = require('winston');
const { combine } = winston.format
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

module.exports = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: LOG_LEVEL, format: combine(
                winston.format.timestamp(),
                winston.format.simple(),
            )
        }),
    ],
})