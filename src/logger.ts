import winston from 'winston'
const { combine } = winston.format
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

export default winston.createLogger({
	transports: [
		new winston.transports.Console({
			level: LOG_LEVEL, format: combine(
				winston.format.timestamp(),
				winston.format.simple(),
			),
		}),
	],
})
