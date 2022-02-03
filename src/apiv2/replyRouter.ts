import { Response, Router } from 'express'
import { accessMiddlewareV2 } from '../controllers/access'
import { ActionType, createAction } from '../controllers/actions'
import * as wykopController from '../controllers/wykop'
import logger from '../logger'
import confession, { ConfessionStatus } from '../models/confession'
import replyModel, { IReply } from '../models/reply'
import { RequestWithUser } from '../utils'
import { makeAPIResponse } from './utils/response'
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

replyRouter.delete('/reply/:id/',
	accessMiddlewareV2('deleteReply'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		wykopController.deleteEntryComment(req.reply.commentID)
			.then(() => {
				return req.reply.populate([{ path: 'parentID', select: ['entryID', 'actions'] }])
					.then(async reply => {
						const action = await createAction(
							req.user._id,
							ActionType.DELETE_REPLY,
							req.reply._id,
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
	accessMiddlewareV2('addReply'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		req.reply.populate([{ path: 'parentID', select: ['entryID', 'actions'] }])
			.then(reply => {
				if (reply.commentID) {
					return res.status(400).json(makeAPIResponse(res, null, { message: 'The reply is already added' }))
				}
				if (reply.status === ConfessionStatus.DECLINED) {
					return res.status(400).json(makeAPIResponse(res, null, {
						message: 'The reply is marked as dangerous. Change status before adding',
					}))
				}
				wykopController.acceptReply(reply, req.user)
					.then(async comment => {
						reply.commentID = comment.id
						reply.status = ConfessionStatus.ACCEPTED
						reply.addedBy = req.user.username
						const action = await createAction(req.user._id, ActionType.ACCEPT_REPLY, reply._id).save()
						await reply.save()
						await confession.updateOne({ _id: reply.parentID }, { $push: { actions: action } })
						const { status, addedBy, commentID } = reply
						return res.json(makeAPIResponse(res, {
							patchObject: { status, addedBy, commentID },
							action,
						}))
					})
					.catch(err => {
						return res.status(500).json(makeAPIResponse(res, null, { message: err.toString() }))
					})
			})
	})

replyRouter.put('/reply/:id/status',
	accessMiddlewareV2('setStatus'),
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
		const action = await createAction(
			req.user._id,
			actionType,
			`${req.reply._id} => ${ConfessionStatus[req.reply.status]}`).save()
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
