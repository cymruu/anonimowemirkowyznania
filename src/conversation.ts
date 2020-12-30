import { Router } from 'express'
import { RequestWithUser } from './utils'
const conversationRouter = Router()
import confessionModel from './models/confession'
import userModel from './models/user'
import * as conversationController from './controllers/conversations'
import config from './config'
import auth from './controllers/authorization'
import { csrfErrorHander, csrfProtection } from './csrf'

function renderConversationRoute(req, res, params) {
	return res.render('conversation', {
		csrfToken: (req as any).csrfToken(),
		...params,
	})
}

conversationRouter.use(auth(false))
conversationRouter.get('/:parent/new', csrfProtection, (req: RequestWithUser, res, next) => {
	if (req.params.parent.substr(0, 2) === 'U_') {
		const username = req.params.parent.substr(2)
		userModel.findOne({ username: username }, { _id: 1, username: 1 }).then(userObject => {
			if (!userObject) { return res.sendStatus(404) }
			return renderConversationRoute(req, res, { type: 'user', userObject })
		}).catch(err => {
			return res.sendStatus(500)
		})
	} else {
		confessionModel.findById(req.params.parent, (err, confession) => {
			if (err) { return res.sendStatus(404) }
			return renderConversationRoute(req, res, { type: 'confession', confession })
		})
	}
})
function createConversationMiddleware(req: RequestWithUser, res) {
	conversationController.createNewConversation(res.locals.conversationParent, (err, conversationid) => {
		if (err) { return res.sendStatus(err) }
		conversationController.newMessage(conversationid, null, req.body.text, req.ip, (err) => {
			if (err) { return res.sendStatus(500) }
			return res.redirect(`/conversation/${conversationid}`)
		})
	})
}
conversationRouter.post('/:parent/new', csrfErrorHander, (req: RequestWithUser, res, next) => {
	if (!req.body.text) { return res.sendStatus(400) }
	if (req.params.parent.substr(0, 2) === 'U_') {
		const username = req.params.parent.substr(2)
		userModel.findOne({ username: username }, { _id: 1, username: 1 }).then(userObject => {
			if (!userObject) { return res.sendStatus(404) }
			res.locals.conversationParent = userObject
			return next()
		}).catch(err => {
			return res.sendStatus(500)
		})
	} else {
		confessionModel.findById(req.params.parent, (err, confession) => {
			if (err) { return res.sendStatus(500) }
			if (!confession) { return res.sendStatus(404) }
			res.locals.conversationParent = confession
			return next()
		})
	}
}, createConversationMiddleware)
conversationRouter.get('/:conversationid/:auth?', csrfProtection, (req: RequestWithUser, res) => {
	if (!req.params.conversationid) {
		return res.sendStatus(400)
	}
	if (!req.params.auth && req.user !== undefined && req.user._id) { req.params.auth = req.user._id.toString() }
	conversationController.getConversation(req.params.conversationid, req.params.auth, (err, conversation) => {
		if (err) { return res.send(err) }
		return renderConversationRoute(req, res, { conversation })
	})
})
conversationRouter.post('/:conversationid/:auth?', csrfErrorHander, (req: RequestWithUser, res) => {
	if (!req.params.conversationid) {
		return res.sendStatus(400)
	}
	if (!req.params.auth && req.user !== undefined && req.user._id) { req.params.auth = req.user._id.toString() }
	conversationController.newMessage(
		req.params.conversationid,
		req.params.auth,
		req.body.text,
		req.ip,
		(err, isOP) => {
			if (err) { return res.send(err) }
			conversationController.getConversation(req.params.conversationid, req.params.auth, (err, conversation) => {
				if (err) { return res.send(err) }
				return res.redirect(`/conversation/${req.params.conversationid}/${req.params.auth || ''}`)
			})
		})
})
export default conversationRouter
