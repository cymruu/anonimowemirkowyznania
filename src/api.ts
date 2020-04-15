import { Router, Request } from 'express'
const apiRouter = Router()
import mongoose from 'mongoose'
import * as wykopController from './controllers/wykop'
import * as surveyController from './controllers/survey'
import { createAction, ActionType } from './controllers/actions'
import * as tagController from './controllers/tags'
import auth from './controllers/authorization'
import { accessMiddleware } from './controllers/access'
import config from './config'
import confessionModel, { ConfessionStatus } from './models/confession'
import statsModel from './models/stats'
import replyModel from './models/reply'
import logger from './logger'

//TODO: move connnection to separate file
mongoose.connect(config.mongoURL,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
	(err) => {
		if (err) {
			logger.error(err)
			process.exit(1)
		}
	})
mongoose.Promise = global.Promise
interface RequestWithUser extends Request {
	user: any;
}
/* api router */
apiRouter.get('/', (req, res) => {
	res.json({ success: true, response: { message: 'API is working!' } })
})
apiRouter.use(auth(true))
apiRouter.route('/confession/accept/:confession_id').get(accessMiddleware('addEntry'), (req: RequestWithUser, res) => {
	confessionModel.findById(req.params.confession_id).populate('survey').exec((err, confession) => {
		if (err) { return res.send(err) }
		if (confession.entryID && confession.status === 1) {
			return res.json({
				success: false,
				response: {
					message: 'It\'s already added',
					entryID: confession.entryID,
					status: 'danger',
				},
			})
		}
		if (confession.status === -1) {
			return res.json({
				success: false,
				response: {
					message: 'It\'s marked as dangerous, unmark first',
					status: 'danger',
				},
			})
		}
		if (confession.survey) {
			surveyController.acceptSurvey(confession, req.user, function(result) {
				if (!result.success && result.relogin) {
					surveyController.wykopLogin()
				}
				if (result.success) {
					wykopController.addNotificationComment(confession, req.user)
					statsModel.addAction('accepted_surveys', req.user.username)
				}
				return res.json(result)
			})
		} else {
			wykopController.acceptConfession(confession, req.user, function(result) {
				if (result.success) {
					wykopController.addNotificationComment(confession, req.user)
					statsModel.addAction('confessions_accepted', req.user.username)
				}
				return res.json(result)
			})
		}
	})
})
apiRouter.route('/confession/danger/:confession_id/:reason?')
	.get(accessMiddleware('setStatus'), (req: RequestWithUser, res) => {
		confessionModel.findById(req.params.confession_id, async (err, confession) => {
			if (err) { return res.json(err) }
			confession.status === ConfessionStatus.DECLINED ?
				confession.status = ConfessionStatus.WAITING : confession.status = ConfessionStatus.DECLINED
			const status = confession.status === ConfessionStatus.WAITING ? 'warning' : 'danger'
			const actionType = confession.status === ConfessionStatus.WAITING ?
				ActionType.REVERT_DECLINE : ActionType.DECLINE
			const reason = req.params.reason
			const action = await createAction(req.user._id, actionType, reason).save()
			confession.actions.push(action)
			confession.save((err) => {
				if (err) { return res.json({ success: false, response: { message: err } }) }
				if (confession.status === -1) { statsModel.addAction('declined_confessions', req.user.username) }
				res.json({ success: true, response: { message: 'Zaaktualizowano status', status: status } })
			})
		})
	})
apiRouter.route('/confession/tags/:confession_id/:tag')
	.get(accessMiddleware('updateTags'), (req: RequestWithUser, res) => {
	//there's probably better way to do this.
		confessionModel.findById(req.params.confession_id, async (err, confession) => {
			if (err) { return res.send(err) }
			const action = await createAction(req.user._id, ActionType.UPDATED_TAGS, req.params.tag).save()
			confession.update({
				$set: {
					tags: tagController.prepareArray(confession.tags, req.params.tag),
				},
				$push: { actions: action._id },
			}).then(success => {
				res.json({ success: true, response: { message: 'Tagi zaaktualizowano', status: 'success' } })
			}, function(err) {
				return res.json({ success: false, response: { message: err } })
			})
		})
	})
apiRouter.route('/confession/delete/:confession_id')
	.get(accessMiddleware('deleteEntry'), (req: RequestWithUser, res) => {
		confessionModel.findById(req.params.confession_id, (err, confession) => {
			if (err) { return res.sendStatus(500) }
			wykopController.deleteEntry(confession.entryID).then(async (result) => {
				const action = await createAction(req.user._id, ActionType.DELETE_ENTRY).save()
				confession.status = -1
				confession.actions.push(action)
				confession.save((err) => {
					if (err) { return res.json({ success: false, response: { message: err } }) }
					statsModel.addAction('deleted_confessions', req.user.username)
					res.json({ success: true, response: { message: `Usunięto wpis ID: ${result.id}` } })
					//TODO: handle response
					wykopController.sendPrivateMessage(
						'sokytsinolop', `${req.user.username} usunął wpis \n ${result.id}`,
					).then()
				})
			}).catch(err => {
				return res.json({ success: false, response: { message: err.error.message } })
			})
		})
	})
apiRouter.route('/reply/accept/:reply_id').get(accessMiddleware('addReply'), (req: RequestWithUser, res) => {
	replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply) => {
		if (err) { return res.json({ success: false, response: { message: err, status: 'warning' } }) }
		if (reply.commentID) {
			res.json({
				success: false,
				response: {
					message: 'It\'s already added',
					commentID: reply.commentID,
					status: 'danger',
				},
			})
			return
		}
		if (reply.status === -1) {
			return res.json({
				success: false,
				response: {
					message: 'It\'s marked as dangerous, unmark first',
					status: 'danger',
				},
			})
		}
		wykopController.acceptReply(reply, req.user, function(result) {
			res.json(result)
			if (result.success) { statsModel.addAction('replies_added', req.user.username) }
		})
	})
})
apiRouter.route('/reply/danger/:reply_id/').get(accessMiddleware('setStatus'), (req: RequestWithUser, res) => {
	replyModel.findById(req.params.reply_id).populate('parentID').exec(async (err, reply) => {
		if (err) { return res.json({ success: false, response: { message: err, status: 'warning' } }) }
		reply.status === ConfessionStatus.DECLINED ? reply.status = ConfessionStatus.WAITING : reply.status = ConfessionStatus.DECLINED
		const status = reply.status === 0 ? 'warning' : 'danger'
		const actionType = reply.status === ConfessionStatus.WAITING ? ActionType.REVERT_DECLINE : ActionType.DECLINE
		const action = await createAction(req.user._id, actionType).save()
		reply.parentID.actions.push(action)
		reply.parentID.save()
		reply.save((err) => {
			if (err) { res.json({ success: false, response: { message: err } }) }
			if (reply.status === -1) { statsModel.addAction('replies_declined', req.user.username) }
			res.json({ success: true, response: { message: 'Status zaaktualizowany', status: status } })
		})
	})
})
apiRouter.route('/reply/delete/:reply_id/').get(accessMiddleware('deleteReply'), (req: RequestWithUser, res) => {
	replyModel.findOne({ _id: req.params.reply_id }).populate('parentID').then(reply => {
		wykopController.deleteEntryComment(reply.commentID).then(async (result) => {
			const action = await createAction(req.user._id, ActionType.DELETE_REPLY, `reply_id: ${result.id}`).save()
			reply.parentID.actions.push(action)
			reply.status = 0
			reply.commentID = null

			Promise.all([reply.save(), reply.parentID.save()]).then(_ => {
				return res.json({ success: true, response: { message: 'Reply removed', status: 'danger' } })
			}).catch(err => {
				return res.json({
					success: false,
					response: {
						message: 'Reply removed but model not updated',
						status: 'warning',
					},
				})
			})
		}).catch(err => {
			return res.json({ success: false, response: { message: err.toString(), status: 'warning' } })
		})
	}).catch(_ => {
		res.json({ success: false, response: { message: 'Cant delete reply', status: 'error' } })
	})
})
export default apiRouter
