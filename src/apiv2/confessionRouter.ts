import { Router, Response } from 'express'
import { RequestWithUser } from '../utils'
import confessionModel, { IConfession, ConfessionStatus } from '../models/confession'
import logger from '../logger'
import { accessMiddleware } from '../controllers/access'
import { authentication } from './middleware/authentication'
import bodyBuilder from '../controllers/bodyBuildier'
import * as wykopController from '../controllers/wykop'
import statsModel from '../models/stats'
import { makeAPIResponse } from './apiV2'
import WykopHTTPClient from '../service/WykopHTTPClient'
import { createAction, ActionType } from '../controllers/actions'
import { WykopRequestQueue } from '../wykop'

export const confessionRouter = Router()

type RequestWithConfession = RequestWithUser & { confession: IConfession }

function getConfessionMiddleWare(req: RequestWithConfession, res: Response, next) {
	confessionModel.findById(req.params.id).then(confession => {
		if (!confession) {
			return res.status(404)
		}
		req.confession = confession
		return next()
	}).catch(err => {
		logger.error(err.toString())
		return res.status(500)
	})
}

confessionRouter.use(authentication)
confessionRouter.get('/', async (req: RequestWithUser, res) => {
	confessionModel
		.find({}, ['_id', 'text', 'status', 'embed', 'auth', 'entryID', 'addedBy'])
		.sort({ _id: -1 })
		.lean()
		.limit(100)
		.then(confessions => {
			res.json(confessions)
		}).catch(err => {
			logger.error(err.toString())
			res.status(500).send(500)
		})
})


confessionRouter.get('/confession/:id', getConfessionMiddleWare, (req, res) => {
	res.json({ success: false })
})
confessionRouter.get('/confession/:id/accept',
	accessMiddleware('addEntry'),
	getConfessionMiddleWare,
	(req: RequestWithConfession, res) => {
		req.confession.populate('survey').execPopulate()
			.then(async (confession) => {
				if (confession.entryID && confession.status === ConfessionStatus.ACCEPTED) {
					return res
						.status(409).json(
							makeAPIResponse(res, null, { message: 'Entry is already added.' }),
						)
				}
				if (confession.status === ConfessionStatus.DECLINED) {
					return res
						.status(409).json(
							makeAPIResponse(res, null, { message: 'Cannot add declined entry.' }),
						)
				}
				const entryBody = await bodyBuilder.getEntryBody(confession, req.user)
				const adultMedia = confession.tags.map(x => x[0]).includes('#nsfw')
				let promise
				if (confession.survey) {
					promise = WykopHTTPClient.acceptSurvey(confession as any, entryBody, adultMedia)
				} else {
					promise = wykopController.acceptConfession(confession, entryBody, adultMedia)
				}
				promise.then(async (response) => {
					confession.entryID = response.id
					const action = await createAction(req.user._id, ActionType.ACCEPT_ENTRY).save()
					confession.actions.push(action)
					confession.status = ConfessionStatus.ACCEPTED
					confession.addedBy = req.user.username
					confession.save().then(() => {
						WykopRequestQueue.addTask(() => wykopController.addNotificationComment(confession, req.user))
						statsModel.addAction('confessions_accepted', req.user.username)
						const { status, addedBy, entryID } = confession
						return res.json(makeAPIResponse(res, {
							updateObject: { status, addedBy, entryID },
						}))
					})
				})
			})
	})
