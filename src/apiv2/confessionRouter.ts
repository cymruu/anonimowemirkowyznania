import { Response, Router } from 'express'
import { accessMiddlewareV2 } from '../controllers/access'
import { ActionType, createAction } from '../controllers/actions'
import bodyBuilder from '../controllers/bodyBuildier'
import { prepareArrayRefactored } from '../controllers/tags'
import * as wykopController from '../controllers/wykop'
import logger from '../logger'
import confessionModel, { ConfessionStatus, IConfession } from '../models/confession'
import { RequestWithUser } from '../utils'
import { WykopRequestQueue } from '../wykop'
import { authentication } from './middleware/authentication'
import { getPage } from './utils/pagination'
import { makeAPIResponse } from './utils/response'

export const confessionRouter = Router()

type RequestWithConfession<T = any> = RequestWithUser<T> & { confession: IConfession }
//TODO: select only needed fields for list
function getConfessionMiddleware(req: RequestWithConfession, res: Response, next) {
	confessionModel.findById(req.params.id)
		.then(confession => {
			if (!confession) {
				res.status(404).json(makeAPIResponse(res, null, { message: 'not found' }))
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
	const query = confessionModel
		.find({}, ['_id', 'text', 'status', 'embed', 'auth', 'entryID', 'survey'])
		.sort({ _id: -1 })
		.lean()

	getPage(req, confessionModel, query)
		.then(paginationObject => {
			res.json(makeAPIResponse(res, paginationObject))
		})
		.catch(err => {
			logger.error(err.toString())
			res.sendStatus(500)
		})
})

confessionRouter.get('/confession/:id',
	accessMiddlewareV2('viewDetails'),
	getConfessionMiddleware, (req: RequestWithConfession, res) => {
		req.confession.populate([
			{
				path: 'actions', options: { sort: { _id: -1 } },
				populate: { path: 'user', select: 'username' },
			},
			{ path: 'survey' },
		])
			.then(confession => {
				return res.json(makeAPIResponse(res, confession))
			}).catch(err => {
				logger.info(err.toString())
			})
	})
confessionRouter.delete('/confession/:id',
	accessMiddlewareV2('deleteEntry'),
	getConfessionMiddleware, (req: RequestWithConfession, res) => {
		wykopController.deleteEntry(req.confession.entryID).then(async () => {
			const action = await createAction(req.user._id, ActionType.DELETE_ENTRY).save()
			req.confession.status = ConfessionStatus.DECLINED
			req.confession.actions.push(action)
			req.confession.save((err) => {
				if (err) { return res.json({ success: false, response: { message: err } }) }
				WykopRequestQueue.addTask(() => wykopController.sendPrivateMessage(
					'sokytsinolop', `${req.user.username} usunął wpis \n ${req.confession.entryID}`,
				))
				const { status } = req.confession
				return res.json(makeAPIResponse(res, {
					message: `Usunięto wpis ID: ${req.confession.entryID}`,
					patchObject: { status },
					action,
				}))
			})
		}).catch(err => {
			return res.json({ success: false, response: { message: err.toString() } })
		})
	})
export interface AcceptConfessionOptions {
	includeEmbed?: boolean
	includeSurvey?: boolean
	isPlus18?: boolean
}
confessionRouter.post('/confession/:id/accept',
	accessMiddlewareV2('addEntry'),
	getConfessionMiddleware,
	async (req: RequestWithConfession<AcceptConfessionOptions>, res) => {
		const confession = req.confession
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
		const adultMedia = req.body.isPlus18 || confession.tags.map(x => x[0]).includes('#nsfw')
		const embed = req.body.includeEmbed ? confession.embed : undefined

		wykopController.acceptConfession(entryBody, embed, adultMedia).then(async (response) => {
			confession.entryID = response.id
			const action = await createAction(req.user._id, ActionType.ACCEPT_ENTRY).save()
			confession.actions.push(action)
			confession.status = ConfessionStatus.ACCEPTED
			confession.addedBy = req.user.username
			confession.save().then(() => {
				const { status, addedBy, entryID } = confession
				return res.json(makeAPIResponse(res, {
					patchObject: { status, addedBy, entryID },
					action,
				}))
			})
		})
			.catch(err => {
				return res
					.status(500).json(
						makeAPIResponse(res, null, { message: err.toString() }),
					)
			})
	})
confessionRouter.put('/confession/:id/status',
	accessMiddlewareV2('setStatus'),
	getConfessionMiddleware,
	async (req: RequestWithConfession, res) => {
		if (!Object.values(ConfessionStatus).includes(req.body.status)) {
			return res.status(400).json(makeAPIResponse(res, null, { message: 'Wrong status' }))
		}
		if (req.confession.status === req.body.status) {
			return res.status(200).json(makeAPIResponse(res, { patchObject: { status: req.confession.status } }))
		}
		const note = req.body.note
		req.confession.status = req.body.status
		const actionType = req.body.status === ConfessionStatus.DECLINED ?
			ActionType.DECLINE_ENTRY
			: ActionType.REVERT_ENTRY_DECLINE
		const action = await createAction(req.user._id, actionType, note).save()
		req.confession.actions.push(action)
		req.confession.save()
			.then(() => {
				res.status(200).json(makeAPIResponse(res, { patchObject: { status: req.confession.status }, action }))
			}).catch(err => {
				logger.error(err.toString())
				res.status(500).json(makeAPIResponse(res, null, { message: 'Internal server error' }))
			})
	})
confessionRouter.put('/confession/:id/tags',
	accessMiddlewareV2('updateTags'),
	getConfessionMiddleware,
	async (req: RequestWithConfession & {body: {tag: string, tagValue: boolean}}, res) => {
		const tagValue = req.body.tagValue
		const action = await createAction(
			req.user._id,
			ActionType.UPDATED_TAGS,
			`${req.body.tag} ${tagValue ? '✓' : '✗'}`)
			.save()
		const newTags = prepareArrayRefactored(req.confession.tags, req.body.tag, tagValue)
		req.confession.updateOne({
			$set: {
				tags: newTags,
			},
			$push: { actions: action._id },
		}).then(() => {
			return res.status(200).json(makeAPIResponse(res, { patchObject: { tags: newTags }, action }))
		}).catch(err => {
			return res.status(500).json(makeAPIResponse(res, null, { message: err.toString() }))
		})
	})
confessionRouter.get('/confession/:id/ip',
	accessMiddlewareV2('viewDetails'),
	accessMiddlewareV2('viewIP'),
	(req: RequestWithConfession, res) => {
		confessionModel.findById(req.params.id)
			.select('_id IPAdress')
			.then(confession => {
				if (!confession) {
					res.status(404).json(makeAPIResponse(res, null, { message: 'not found' }))
				}
				return res.status(200).json(makeAPIResponse(res, confession))
			}).catch(err => {
				logger.error(err.toString())
				return res.sendStatus(500)
			})
	})
confessionRouter.get('/confession/:id/otherFromIp',
	accessMiddlewareV2('viewDetails'),
	getConfessionMiddleware,
	(req: RequestWithConfession, res) => {
		confessionModel
			.find({ IPAdress: req.confession.IPAdress }, { _id: 1, status: 1 })
			.sort({ _id: -1 })
			.then(confessions => {
				return res.json(makeAPIResponse(res, { confessions }))
			}).catch(() => {
				return res.status(500).json(makeAPIResponse(res, null, { message: 'internal server error' }))
			})
	},
)
