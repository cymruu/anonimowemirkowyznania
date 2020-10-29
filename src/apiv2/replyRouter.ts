import { Response, Router } from 'express'
import { accessMiddleware } from '../controllers/access'
import * as wykopController from '../controllers/wykop'
import logger from '../logger'
import { ConfessionStatus } from '../models/confession'
import replyModel, { IReply } from '../models/reply'
import { RequestWithUser } from '../utils'
import { makeAPIResponse } from './apiV2'
import { authentication } from './middleware/authentication'

export const replyRouter = Router()

type RequestWithReply = RequestWithUser & { reply: IReply }

function getReplyMiddleware(req: RequestWithReply, res: Response, next) {
	replyModel.findById(req.params.id).then(reply => {
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
	replyModel
		.find({}, ['_id', 'text', 'status', 'embed', 'auth', 'commentID', 'addedBy'])
		.populate('parentID', 'entryID')
		.sort({ _id: -1 })
		.lean()
		.limit(100)
		.then(replies => {
			res.json(makeAPIResponse(res, replies))
		}).catch(err => {
			logger.error(err.toString())
			res.status(500).send(500)
		})
})
replyRouter.get('/reply/:id/accept',
	accessMiddleware('addReply'),
	getReplyMiddleware,
	(req: RequestWithReply, res) => {
		const reply = req.reply
		if (reply.commentID) {
			res.status(400)
			return res.json(makeAPIResponse(res, null, { message: 'It\'s already added' }))
		}
		if (reply.status === ConfessionStatus.DECLINED) {
			res.status(400)
			return res.json(makeAPIResponse(res, null, { message: 'The reply is marked declined' }))
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
						logger.error(err.toString())
					})
			})
	})
