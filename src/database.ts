import mongoose from 'mongoose'
import config from './config'
import logger from './logger'

mongoose.connect(config.mongoURL,
	{},
	(err) => {
		if (err) {
			logger.error(err)
			process.exit(1)
		}
	})
