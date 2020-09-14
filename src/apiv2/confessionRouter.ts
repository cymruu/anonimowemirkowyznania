import { Response, Router } from 'express'
import { accessMiddleware } from '../controllers/access'
import { ActionType, createAction } from '../controllers/actions'
import bodyBuilder from '../controllers/bodyBuildier'
import * as wykopController from '../controllers/wykop'
import logger from '../logger'
import confessionModel, { ConfessionStatus, IConfession } from '../models/confession'
import statsModel from '../models/stats'
import WykopHTTPClient from '../service/WykopHTTPClient'
import { RequestWithUser } from '../utils'
import { WykopRequestQueue } from '../wykop'
import { makeAPIResponse } from './apiV2'
import { authentication } from './middleware/authentication'
import confession from '../models/confession'

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
			res.json(makeAPIResponse(res, confessions))
		}).catch(err => {
			logger.error(err.toString())
			res.status(500).send(500)
		})
})


confessionRouter.get('/confession/:id',
	accessMiddleware('viewDetails'),
	getConfessionMiddleWare, (req: RequestWithConfession, res) => {
		req.confession.populate([
			{
				path: 'actions', options: { sort: { _id: -1 } },
				populate: { path: 'user', select: 'username' },
			},
			{ path: 'survey' },
		]).execPopulate()
			.then(confession => {
				return res.json(makeAPIResponse(res, confession))

			}).catch(err => {
				logger.info(err.toString())
			})
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
							patchObject: { status, addedBy, entryID },
						}))
					})
				})
			})
	})
confessionRouter.put('/confession/:id/status',
	accessMiddleware('setStatus'),
	getConfessionMiddleWare,
	async (req: RequestWithConfession, res) => {
		if (!Object.values(ConfessionStatus).includes(req.body.status)) {
			return res.status(400).json(makeAPIResponse(res, null, { message: 'Wrong status' }))
		}
		const note = req.body.note
		req.confession.status = req.body.status
		const actionType = req.body.status === ConfessionStatus.DECLINED ?
			ActionType.DECLINE
			: ActionType.REVERT_DECLINE
		const action = await createAction(req.user._id, actionType, note).save()
		req.confession.actions.push(action)
		req.confession.save()
			.then(() => {
				res.status(200).json(makeAPIResponse(res, { patchObject: { status: req.confession.status } }))
			}).catch(err => {
				logger.error(err.toString())
				res.status(500).json(makeAPIResponse(res, null, { message: 'Internal server error' }))
			})
	})
