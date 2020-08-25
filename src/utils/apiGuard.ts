import logger from '../logger'

const modelsBeingProcessed = []

const modelParams = ['confession_id', 'reply_id']

export const guardMiddleware = (req, res, next) => {
	for (const interestingParam of modelParams) {
		const value = req.params[interestingParam]
		if (value) {
			if (modelsBeingProcessed.indexOf(value) > -1) {
				return res.json({
					success: false,
					response: {
						message: 'Proszę czekać, wpis jest aktualnie przetwarzany.',
					},
				})
			}
			logger.debug(`Adding ${value} to ModelsBeingProcessed`)
			modelsBeingProcessed.push(value)
			res.on('close', () => {
				logger.debug('Close')
				removeValue(value)
			})
		}
	}

	next()
}
export const removeValue = (value) => {
	const index = modelsBeingProcessed.indexOf(value)
	if (index >= 0) {
		logger.debug(`Removing ${value} from ModelsBeingProcessed`)
		modelsBeingProcessed.splice(index, 1)
	}
}
