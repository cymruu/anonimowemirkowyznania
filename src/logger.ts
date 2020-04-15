import winston from 'winston'
const { combine } = winston.format
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

const logger = winston.createLogger({
	format: combine(
		winston.format.timestamp(),
		winston.format.simple(),
	),
})
if (process.env.NODE_ENV === 'development') {
	logger.add(new winston.transports.Console({
		level: LOG_LEVEL,
	}))
}
if (process.env.NODE_EVN === 'production') {
	logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }))
	logger.add(new winston.transports.File({ filename: 'all.log' }))
}
export default logger
