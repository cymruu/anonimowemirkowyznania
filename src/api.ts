import { Router, Request } from 'express'
const apiRouter = Router()
import mongoose from 'mongoose'
import * as wykopController from './controllers/wykop'
import { createAction, ActionType } from './controllers/actions'
import * as tagController from './controllers/tags'
import auth from './controllers/authorization'
import { accessMiddlewareV1 } from './controllers/access'
import config from './config'
import confessionModel, { ConfessionStatus } from './models/confession'
import replyModel from './models/reply'
import logger from './logger'
import { guardMiddleware } from './utils/apiGuard'
import bodyBuilder from './controllers/bodyBuildier'
import WykopHTTPClient from './service/WykopHTTPClient'
import { WykopRequestQueue } from './wykop'
import { ISurvey } from './models/survey'

//TODO: move connnection to separate file
mongoose.connect(config.mongoURL,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
	(err) => {
		if (err) {
			logger.error(err)
			process.exit(1)
		}
	})

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
	accessMiddlewareV1('addEntry'),
	async (req: RequestWithUser, res) => {
		confessionModel.findById(req.params.confession_id).populate('survey').exec(async (err, confession) => {
			if (err) { return res.send(err) }
			if (confession.entryID && confession.status === ConfessionStatus.ACCEPTED) {
				return res.json({
					success: false,
					response: {
						message: 'Wpis został już dodany',
						entryID: confession.entryID,
						status: 'danger',
					},
				})
			}
			if (confession.status === ConfessionStatus.DECLINED) {
				return res.json({
					success: false,
					response: {
						message: 'Wpis jest oznaczony jako niebezpieczny, zmień jego status aby dodać',
						status: 'danger',
					},
				})
			}
			const entryBody = await bodyBuilder.getEntryBody(confession, req.user)
			const adultMedia = confession.tags.map(x => x[0]).includes('#nsfw')
			let promise
			if (confession.survey) {
				promise = WykopHTTPClient.acceptSurvey(
					confession.survey as ISurvey, entryBody, confession.embed, adultMedia)
			} else {
				promise = wykopController.acceptConfession(entryBody, confession.embed, adultMedia)
			}
			promise.then(async (response) => {
				confession.entryID = response.id
				const action = await createAction(req.user._id, ActionType.ACCEPT_ENTRY).save()
				confession.actions.push(action)
				confession.status = ConfessionStatus.ACCEPTED
				confession.addedBy = req.user.username
				confession.save().then(() => {
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
		accessMiddlewareV1('setStatus'),
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
					res.json({ success: true, response: { message: 'Zaaktualizowano status', status: newStatusStr } })
				})
			})
		})
apiRouter.route('/confession/tags/:confession_id/:tag')
	.get(guardMiddleware, accessMiddlewareV1('updateTags'), (req: RequestWithUser, res) => {
	//there's probably better way to do this.
		confessionModel.findById(req.params.confession_id, async (err, confession) => {
			if (err) { return res.send(err) }
			const action = await createAction(req.user._id, ActionType.UPDATED_TAGS, req.params.tag).save()
			confession.updateOne({
				$set: {
					tags: tagController.prepareArray(confession.tags, req.params.tag),
				},
				$push: { actions: action._id },
			}).then(() => {
				res.json({ success: true, response: { message: 'Tagi zaaktualizowano', status: 'success' } })
			}, function(err) {
				return res.json({ success: false, response: { message: err } })
			})
		})
	})
apiRouter.route('/confession/delete/:confession_id')
	.get(
		guardMiddleware,
		accessMiddlewareV1('deleteEntry'),
		(req: RequestWithUser, res) => {
			confessionModel.findById(req.params.confession_id, (err, confession) => {
				if (err) { return res.sendStatus(500) }
				wykopController.deleteEntry(confession.entryID).then(async () => {
					const action = await createAction(req.user._id, ActionType.DELETE_ENTRY).save()
					confession.status = ConfessionStatus.DECLINED
					confession.actions.push(action)
					confession.save((err) => {
						if (err) { return res.json({ success: false, response: { message: err } }) }
						res.json({ success: true, response: { message: `Usunięto wpis ID: ${confession.entryID}` } })
						WykopRequestQueue.addTask(() => wykopController.sendPrivateMessage(
							'sokytsinolop', `${req.user.username} usunął wpis \n ${confession.entryID}`,
						))
					})
				}).catch(err => {
					return res.json({ success: false, response: { message: err.toString() } })
				})
			})
		})
apiRouter.route('/reply/accept/:reply_id').get(
	guardMiddleware,
	accessMiddlewareV1('addReply'),
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
			if (reply.status === ConfessionStatus.DECLINED) {
				return res.json({
					success: false,
					response: {
						message: 'It\'s marked as dangerous, unmark first',
						status: 'danger',
					},
				})
			}
			wykopController.acceptReply(reply, req.user).then(reply => {
				res.json({ success: true, response: {
					message: 'Reply added', commentID: reply.commentID, status: 'success' },
				})
			}).catch(err => {
				res.json({ success: false, response: { message: err.toString() }, status: 'error' })
			})
		})
	})
apiRouter.route('/reply/danger/:reply_id/').get(
	guardMiddleware,
	accessMiddlewareV1('setStatus'),
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
			const actionType = ActionType.REPLY_CHANGE_STATUS
			const action = await createAction(req.user._id, actionType).save()
			reply.parentID.actions.push(action)
			reply.parentID.save()
			reply.save((err) => {
				if (err) { res.json({ success: false, response: { message: err } }) }
				res.json({ success: true, response: { message: 'Status zaaktualizowany', status: newStatusStr } })
			})
		})
	})
apiRouter.route('/reply/delete/:reply_id/').get(
	guardMiddleware,
	accessMiddlewareV1('deleteReply'),
	(req: RequestWithUser, res) => {
		replyModel.findOne({ _id: req.params.reply_id }).populate('parentID').then(reply => {
			wykopController.deleteEntryComment(reply.commentID).then(async () => {
				const action = await createAction(
					req.user._id,
					ActionType.DELETE_REPLY,
					`reply_id: ${req.params.reply_id}`,
				).save()
				reply.parentID.actions.push(action)
				reply.status = ConfessionStatus.DECLINED,
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
				return res.json({ success: false, response: { message: err.toString(), status: 'warning' } })
			})
		}).catch(err => {
			logger.error(err.toString())
			res.json({ success: false, response: {
				message: 'Nie można usunąć odpowiedzi. Wystąpił błąd', status: 'error' },
			})
		})
	})
export default apiRouter
