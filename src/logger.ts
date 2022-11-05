import winston from 'winston'
const { combine } = winston.format
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

const logger = winston.createLogger({
	format: combine(
		winston.format.timestamp(),
		winston.format.simple(),
	),
})

logger.add(new winston.transports.Console({
	level: LOG_LEVEL,
}))

export default logger
