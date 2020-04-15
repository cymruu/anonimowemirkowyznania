import { Router } from 'express'
const conversationRouter = Router
const confessionModel = require('./models/confession.ts')
const userModel = require('./models/user.ts')
const conversationController = require('./controllers/conversations.ts')
const config = require('./config.ts')
const auth = require('./controllers/authorization.ts')
const { wss } = require('./controllers/wsServer.ts')
conversationRouter.use(auth(false))
conversationRouter.get('/:parent/new', (req, res, next) => {
	if (req.params.parent.substr(0, 2) === 'U_') {
		const username = req.params.parent.substr(2)
		userModel.findOne({ username: username }, { _id: 1, username: 1 }, function(err, userObject) {
			if (err) { return res.sendStatus(503) }
			if (!userObject) { return res.sendStatus(404) }
			return res.render('conversation', { type: 'user', userObject })
		})
	} else {
		confessionModel.findById(req.params.parent, (err, confession) => {
			if (err) { return res.sendStatus(404) }
			return res.render('conversation', { type: 'confession', confession })
		})
	}
})
function createConversationMiddleware(req, res) {
	conversationController.createNewConversation(res.locals.conversationParent, (err, conversationid) => {
		if (err) { return res.sendStatus(err) }
		conversationController.newMessage(conversationid, null, req.body.text, req.ip, (err) => {
			if (err) { return res.sendStatus(500) }
			return res.redirect(`/conversation/${conversationid}`)
		})
	})
}
conversationRouter.post('/:parent/new', (req, res, next) => {
	if (!req.body.text) { return res.sendStatus(400) }
	if (req.params.parent.substr(0, 2) == 'U_') {
		const username = req.params.parent.substr(2)
		userModel.findOne({ username: username }, { _id: 1, username: 1 }, function(err, userObject) {
			if (err) { return res.sendStatus(503) }
			if (!userObject) { return res.sendStatus(404) }
			res.locals.conversationParent = userObject
			return next()
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
conversationRouter.get('/:conversationid/:auth?', (req, res) => {
	if (!req.params.conversationid) {
		return res.sendStatus(400)
	}
	if (!req.params.auth && typeof req.user !== 'undefined' && req.user._id) { req.params.auth = 'U_' + req.user._id }
	conversationController.getConversation(req.params.conversationid, req.params.auth, (err, conversation) => {
		if (err) { return res.send(err) }
		res.render('conversation', { conversation, siteURL: config.siteURL })
	})
})
conversationRouter.post('/:conversationid/:auth?', (req, res) => {
	if (!req.params.conversationid) {
		return res.sendStatus(400)
	}
	if (!req.params.auth && typeof req.user !== 'undefined' && req.user._id) { req.params.auth = 'U_' + req.user._id }
	conversationController.newMessage(req.params.conversationid, req.params.auth, req.body.text, req.ip, (err, isOP) => {
		if (err) { return res.send(err) }
		conversationController.getConversation(req.params.conversationid, req.params.auth, (err, conversation) => {
			if (err) { return res.send(err) }
			res.render('conversation', { conversation, siteURL: config.siteURL })
			wss.sendToChannel(req.params.conversationid, JSON.stringify({ type: 'newMessage', msg: req.body.text, username: 'Użytkownik mikrobloga' }))
		})
	})
})
export default conversationRouter
