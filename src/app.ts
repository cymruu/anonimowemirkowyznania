if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production'
}
let _port: number | string = 1337
let PhusionPassenger: any
if (typeof (PhusionPassenger) !== 'undefined') {
	PhusionPassenger.configure({ autoInstall: false })
	_port = 'passenger'
}
import http from 'http'
import express from 'express'
const app = express()
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import apiRouter from './api'
import adminRouter from './admin'
import conversationRouter from './conversation'
import confessionModel from './models/confession'
import replyModel from './models/reply'
import advertismentModel from './models/ads'
import statsModel from './models/stats'

import * as wykopController from './controllers/wykop'
import actionController from './controllers/actions'
import * as tagController from './controllers/tags'
import auth from './controllers/authorization'
import aliasGenerator from './controllers/aliases'
import * as surveyController from './controllers/survey'
import crypto from 'crypto'
import { bindWebsocketToServer } from './controllers/wsServer'
import logger from './logger'

app.enable('trust proxy')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use('/api', apiRouter)
app.use('/admin', adminRouter)
app.use('/conversation', conversationRouter)
app.use(auth(false))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
	res.render('index')
})
app.post('/', async (req, res) => {
	const confession = new confessionModel()
	if (req.body.survey && req.body.survey.question) {
		req.body.survey.answers = req.body.survey.answers.filter((e) => { return e })
		const validationResult = surveyController.validateSurvey(req.body.survey)
		if (validationResult.success === false) { return res.send(validationResult.response.message) }
	} else {
		delete req.body.survey
	}
	req.body.text = req.body.text || ''
	confession.text = req.body.text
	confession.IPAdress = req.ip
	confession.remotePort = req.connection.remotePort
	confession.embed = req.body.embed
	confession.tags = tagController.getTags(req.body.text)
	confession.auth = crypto.randomBytes(5).toString('hex')
	const action = await actionController(null, 0).save()
	confession.actions.push(action)
	confession.save((err) => {
		if (err) { return res.send(err) }
		if (req.body.survey) {
			surveyController.saveSurvey(confession, req.body.survey)
			statsModel.addAction('new_surveys')
		}
		statsModel.addAction('new_confessions')
		res.redirect(`confession/${confession._id}/${confession.auth}`)
	})
})
app.get('/confession/:confessionid/:auth', (req, res) => {
	if (!req.params.confessionid || !req.params.auth) {
		return res.sendStatus(400)
	} else {
		confessionModel.findOne({
			_id: req.params.confessionid,
			auth: req.params.auth,
		})
			.populate([
				{
					path: 'actions', options: { sort: { _id: -1 } },
					populate: { path: 'user', select: 'username' },
				},
				{ path: 'survey' }])
			.exec((err, confession) => {
				if (err) { return res.send(err) }
				if (!confession) { return res.sendStatus(404) }
				res.render('confession', { confession: confession })
			})
	}
})
app.get('/reply/:confessionid?', (req, res) => {
	if (!req.params.confessionid) {
		return res.sendStatus(400)
	} else {
		confessionModel.findById(req.params.confessionid, (err, confession) => {
			if (err) { return res.sendStatus(404) }
			wykopController.getParticipants(confession.entryID).then(participants => {
				confession.participants = participants
			}).catch(_ => {
				confession.participants = []
			}).finally(() => {
				res.render('reply', { confession: confession })
			})
		})
	}
})
app.post('/reply/:confessionid', (req, res) => {
	confessionModel.findById(req.params.confessionid, (err, confession) => {
		if (err) { return res.sendStatus(404) }
		if (confession) {
			const reply = new replyModel()
			reply.text = req.body.text
			reply.IPAdress = req.ip
			reply.remotePort = req.connection.remotePort
			reply.embed = req.body.embed
			reply.alias = req.body.alias || aliasGenerator(Math.random() >= 0.5)
			if (reply.alias.trim() === confession.auth) {
				reply.alias = 'OP'
				reply.authorized = true
			}
			reply.auth = crypto.randomBytes(5).toString('hex')
			reply.parentID = confession._id
			reply.save(async (err) => {
				if (err) { res.send(err) }
				statsModel.addAction('new_reply')
				const action = await actionController(null, 4).save()
				confession.actions.push(action)
				confession.save()
				res.render('reply', { success: true, reply: reply, confession: confession })
			})
		} else {
			return res.sendStatus(404)
		}
	})
})
app.get('/followers/:confessionid', (req, res) => {
	confessionModel.findById(req.params.confessionid, ['notificationCommentId'], (err, confession) => {
		if (err) { return res.sendStatus(500) }
		if (!confession) { return res.sendStatus(404) }
		wykopController.getFollowers(confession.notificationCommentId)
			.then(result => {
				res.send(result.map(x => `@${x.author.login}`).join(', '))
			})
			.catch(err => {
				res.json(err)
			})
	})
})
app.get('/about', (req, res) => {
	res.render('about')
})
app.get('/twojewyznania', (req, res) => {
	res.render('confessionsList')
})
app.get('/contact', (req, res) => {
	res.render('contact')
})
app.get('/link/:linkId/:from', function(req, res) {
	advertismentModel.findOne({ _id: req.params.linkId }, function(err, ad) {
		if (err || !ad) { return res.sendStatus(404) }
		ad.visits.push({ IPAdress: req.ip, from: req.params.from })
		ad.save()
		res.redirect(ad.out)
	})
})
const server = http.createServer(app)
bindWebsocketToServer(server)
server.listen(_port, () => {
	logger.info(`Server started on port: ${_port} [${process.env.NODE_ENV}]`)
})