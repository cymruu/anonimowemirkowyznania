import { Response, Router } from 'express'
import { accessMiddleware } from '../controllers/access'
import { ActionType, createAction } from '../controllers/actions'
import * as wykopController from '../controllers/wykop'
import logger from '../logger'
import confession, { ConfessionStatus } from '../models/confession'
import reply from '../models/reply'
import replyModel, { IReply } from '../models/reply'
import { RequestWithUser } from '../utils'
import { makeAPIResponse } from './apiV2'
import { authentication } from './middleware/authentication'
import { getPage } from './utils/pagination'

export const replyRouter = Router()

type RequestWithReply = RequestWithUser & { reply: IReply }

function getReplyMiddleware(req: RequestWithReply, res: Response, next) {
	replyModel.findById(req.params.id)
		.then(reply => {
			if (!reply) {
				return res.status(404)
			}
			req.reply = reply
			return next()
		}).catch(err => {
			logger.error(err.toString())
			return res.status(500)
		})
}

replyRouter.use(authentication)
replyRouter.get('/', async (req: RequestWithUser, res) => {
	const query =
	replyModel
		.find({}, ['_id', 'text', 'status', 'alias', 'embed', 'auth', 'commentID', 'addedBy'])
		.populate('parentID', 'entryID')
		.sort({ _id: -1 })
		.lean()

	getPage(req, replyModel, query).then(paginationObject => {
		res.json(makeAPIResponse(res, paginationObject))

	}).catch(err => {
		logger.error(err.toString())
		res.sendStatus(500)
	})
})

replyRouter.get('/reply/:id/accept',
	accessMiddleware('addReply'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		const reply = req.reply
		if (reply.commentID) {
			return res.status(400).json(makeAPIResponse(res, null, { message: 'It\'s already added' }))
		}
		if (reply.status === ConfessionStatus.DECLINED) {
			return res.status(400).json(makeAPIResponse(res, null, { message: 'The reply is marked declined' }))
		}
		req.reply.populate([{ path: 'parentID', select: ['entryID', 'actions'] }]).execPopulate()
			.then((reply) => {
				wykopController.acceptReply(reply, req.user)
					.then((reply) => {
						const { status, addedBy, commentID } = reply
						const action = reply.parentID.actions[0]
						return res.json(makeAPIResponse(res, {
							patchObject: { status, addedBy, commentID },
							action,
						}))
					})
					.catch((err) => {
						res.status(500)
						return res.json(makeAPIResponse(res, null, { message: err.toString() }))
					})
			})
	})

replyRouter.delete('/reply/:id/',
	accessMiddleware('deleteReply'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		wykopController.deleteEntryComment(req.reply.commentID)
			.then(() => {
				return req.reply.populate([{ path: 'parentID', select: ['entryID', 'actions'] }]).execPopulate()
					.then(async reply => {
						const action = await createAction(
							req.user._id,
							ActionType.DELETE_REPLY,
							`reply_id: ${req.params.id}`,
						).save()
						reply.parentID.actions.push(action)
						reply.status = ConfessionStatus.DECLINED,
						reply.commentID = null
						return Promise.all([reply.save(), reply.parentID.save()]).then(_ => {
							return res.json(makeAPIResponse(res,
								{ action, patchObject: {
									status: reply.status,
									commentID: reply.commentID,
								} },
							))
						})
					}).catch(err => {
						res.status(500).json(makeAPIResponse(res, null, { message: err.toString() }))
					})
			})
	})

replyRouter.get('/reply/:id/accept',
	accessMiddleware('addEntry'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		if (req.reply.commentID) {
			return res.status(400)
				.json(makeAPIResponse(res, null, { message: 'The reply is already added' }))
		}
		if (req.reply.status === ConfessionStatus.DECLINED) {
			return res.status(400)
				.json(makeAPIResponse(res, null, {
					message: 'The reply is marked as dangerous. Change status before adding',
				}))
		}
		wykopController.acceptReply(req.reply, req.user).then(async reply => {
			const { status, addedBy, commentID } = reply
			const action = await createAction(req.user._id, ActionType.ACCEPT_REPLY).save()
			confession.updateOne({ _id: req.reply.parentID }, { $push: { actions: action } })
			return res.json(makeAPIResponse(res, {
				patchObject: { status, addedBy, commentID },
				action,
			}))
		}).catch(err => {
			res.status(500).json(makeAPIResponse(res, null, { message: err.toString() }))
		})
	},
)
replyRouter.put('/reply/:id/status',
	accessMiddleware('setStatus'),
	getReplyMiddleware,
	async (req: RequestWithReply, res) => {
		if (!Object.values(ConfessionStatus).includes(req.body.status)) {
			return res.status(400).json(makeAPIResponse(res, null, { message: 'Wrong status' }))
		}
		if (req.reply.status === req.body.status) {
			return res.status(200).json(makeAPIResponse(res, { patchObject: { status: req.reply.status } }))
		}
		req.reply.status = req.body.status
		const actionType = ActionType.REPLY_CHANGE_STATUS
		const action = await createAction(req.user._id, actionType).save()
		// TODO: refactor in other places how the action is added to parent - this is correct way
		await confession.updateOne({ _id: req.reply.parentID }, { $push: { actions: action } })
		req.reply.save()
			.then(() => {
				res.status(200).json(makeAPIResponse(res, { patchObject: { status: req.reply.status }, action }))
			})
			.catch(err => {
				logger.error(err.toString())
				res.status(500).json(makeAPIResponse(res, null, { message: 'Internal server error' }))
			})
	},
)
