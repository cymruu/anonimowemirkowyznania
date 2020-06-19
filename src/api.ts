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
import { guardMiddleware } from './utils/apiGuard'
import bodyBuilder from './controllers/bodyBuildier'
import donationModel from './models/donation'
import WykopHTTPClient from './service/WykopHTTPClient'

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
apiRouter.route('/confession/accept/:confession_id').get(
	guardMiddleware,
	accessMiddleware('addEntry'),
	async (req: RequestWithUser, res) => {
		confessionModel.findById(req.params.confession_id).populate('survey').exec(async (err, confession) => {
			if (err) { return res.send(err) }
			if (confession.entryID && confession.status === 1) {
				return res.json({
					success: false,
					response: {
						message: 'Wpis został już dodany',
						entryID: confession.entryID,
						status: 'danger',
					},
				})
			}
			if (confession.status === -1) {
				return res.json({
					success: false,
					response: {
						message: 'Wpis jest oznaczony jako niebezpieczny, zmień jego status aby dodać',
						status: 'danger',
					},
				})
			}
			const donationsToShare = await donationModel.find({ added: false })
			const entryBody = await bodyBuilder.getEntryBody(confession, req.user, donationsToShare)
			let promise
			if (confession.survey) {
				promise = WykopHTTPClient.acceptSurvey(confession as any, entryBody)
			} else {
				promise = wykopController.acceptConfession(confession, entryBody)
			}
			promise.then(async (response) => {
				confession.entryID = response.id
				const action = await createAction(req.user._id, ActionType.ACCEPT_ENTRY).save()
				confession.actions.push(action)
				confession.status = 1
				confession.addedBy = req.user.username
				const saveActions = Promise.all([confession.save(), ...donationsToShare.map(x =>
					x.update({ added: true },
					)),
				])
				saveActions.then(() => {
					wykopController.addNotificationComment(confession, req.user)
					statsModel.addAction('confessions_accepted', req.user.username)
					return res.json(
						{ success: true, response: {
							message: 'Wpis został dodany', status: 'success' },
						},
					)
				}).catch(() => {
					return res.json(
						{ success: false,
							response: {
								message: 'Wpis został dodany, ale nie zapis w bazie danych się nie powiódł',
								status: 'success',
							},
						},
					)
				})
			}).catch(err => {
				logger.error(err)
				return res.json(
					{ success: false, response: {
						message: err.toString(), status: 'error' },
					},
				)
			})
		})
	})
apiRouter.route('/confession/danger/:confession_id/:reason?')
	.get(guardMiddleware,
		accessMiddleware('setStatus'),
		(req: RequestWithUser, res) => {
			confessionModel.findById(req.params.confession_id, async (err, confession) => {
				if (err) { return res.json(err) }
				if (confession.status === ConfessionStatus.ACCEPTED) {
					return res.json(
						{ success: true, response: {
							message: 'Wpis został już dodany, nie można zmienić statusu.', status: 'success' },
						},
					)
				}
				confession.status = confession.status === ConfessionStatus.DECLINED ?
					ConfessionStatus.WAITING : ConfessionStatus.DECLINED
				const newStatusStr = confession.status === ConfessionStatus.WAITING ? 'warning' : 'danger'
				const actionType = confession.status === ConfessionStatus.WAITING ?
					ActionType.REVERT_DECLINE : ActionType.DECLINE
				const reason = req.params.reason
				const action = await createAction(req.user._id, actionType, reason).save()
				confession.actions.push(action)
				confession.save((err) => {
					if (err) { return res.json({ success: false, response: { message: err } }) }
					if (confession.status === -1) { statsModel.addAction('declined_confessions', req.user.username) }
					res.json({ success: true, response: { message: 'Zaaktualizowano status', status: newStatusStr } })
				})
			})
		})
apiRouter.route('/confession/tags/:confession_id/:tag')
	.get(guardMiddleware, accessMiddleware('updateTags'), (req: RequestWithUser, res) => {
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
	.get(
		guardMiddleware,
		accessMiddleware('deleteEntry'),
		(req: RequestWithUser, res) => {
			confessionModel.findById(req.params.confession_id, (err, confession) => {
				if (err) { return res.sendStatus(500) }
				wykopController.deleteEntry(confession.entryID).then(async (result) => {
					const action = await createAction(req.user._id, ActionType.DELETE_ENTRY).save()
					confession.status = -1
					confession.actions.push(action)
					confession.save((err) => {
						if (err) { return res.json({ success: false, response: { message: err } }) }
						statsModel.addAction('deleted_confessions', req.user.username)
						res.json({ success: true, response: { message: `Usunięto wpis ID: ${confession.entryID}` } })
						//TODO: handle response
						wykopController.sendPrivateMessage(
							'sokytsinolop', `${req.user.username} usunął wpis \n ${confession.entryID}`,
						).then()
					})
				}).catch(err => {
					logger.error(err)
					return res.json({ success: false, response: { message: err.toString() } })
				})
			})
		})
apiRouter.route('/reply/accept/:reply_id').get(
	guardMiddleware,
	accessMiddleware('addReply'),
	(req: RequestWithUser, res) => {
		replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply) => {
			if (err) { return res.json({ success: false, response: { message: err, status: 'warning' } }) }
			if (reply.commentID) {
				return res.json({
					success: false,
					response: {
						message: 'It\'s already added',
						commentID: reply.commentID,
						status: 'danger',
					},
				})
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
				if (result.success) { statsModel.addAction('replies_added', req.user.username) }
				return res.json(result)
			})
		})
	})
apiRouter.route('/reply/danger/:reply_id/').get(
	guardMiddleware,
	accessMiddleware('setStatus'),
	(req: RequestWithUser, res) => {
		replyModel.findById(req.params.reply_id).populate('parentID').exec(async (err, reply) => {
			if (err) { return res.json({ success: false, response: { message: err, status: 'warning' } }) }
			if (reply.status === ConfessionStatus.ACCEPTED) {
				return res.json(
					{ success: true, response: {
						message: 'Komentarz został już dodany, nie można zmienić statusu.', status: 'success' },
					},
				)
			}
			reply.status = reply.status === ConfessionStatus.DECLINED ?
				ConfessionStatus.WAITING : ConfessionStatus.DECLINED
			const newStatusStr = reply.status === 0 ? 'warning' : 'danger'
			const actionType = reply.status === ConfessionStatus.WAITING ?
				ActionType.REVERT_DECLINE : ActionType.DECLINE
			const action = await createAction(req.user._id, actionType).save()
			reply.parentID.actions.push(action)
			reply.parentID.save()
			reply.save((err) => {
				if (err) { res.json({ success: false, response: { message: err } }) }
				if (reply.status === -1) { statsModel.addAction('replies_declined', req.user.username) }
				res.json({ success: true, response: { message: 'Status zaaktualizowany', status: newStatusStr } })
			})
		})
	})
apiRouter.route('/reply/delete/:reply_id/').get(
	guardMiddleware,
	accessMiddleware('deleteReply'),
	(req: RequestWithUser, res) => {
		replyModel.findOne({ _id: req.params.reply_id }).populate('parentID').then(reply => {
			wykopController.deleteEntryComment(reply.commentID).then(async (result) => {
				const action = await createAction(
					req.user._id,
					ActionType.DELETE_REPLY,
					`reply_id: ${req.params.reply_id}`,
				).save()
				reply.parentID.actions.push(action)
				reply.status = 0
				reply.commentID = null

				Promise.all([reply.save(), reply.parentID.save()]).then(_ => {
					return res.json({ success: true, response: {
						message: 'Komentarz do wpisu usunięty', status: 'danger' },
					})
				}).catch(err => {
					logger.error(err)
					return res.json({
						success: false,
						response: {
							message: 'Reply removed but model not updated',
							status: 'warning',
						},
					})
				})
			}).catch(err => {
				logger.error(err)
				return res.json({ success: false, response: { message: err.toString(), status: 'warning' } })
			})
		}).catch(err => {
			logger.error(err)
			res.json({ success: false, response: {
				message: 'Nie można usunąć odpowiedzi. Wystąpił błąd', status: 'error' },
			})
		})
	})
export default apiRouter
