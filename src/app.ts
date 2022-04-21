if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production'
}
import cookieParser from 'cookie-parser'
import crypto from 'crypto'
import express from 'express'
import http from 'http'
import path from 'path'
import Stripe from 'stripe'
import adminRouter from './admin'
import apiRouter from './api'
import apiv2Router from './apiv2/apiV2'
import config from './config'
import { ActionType, createAction } from './controllers/actions'
import aliasGenerator from './controllers/aliases'
import auth from './controllers/authorization'
import * as tagController from './controllers/tags'
import * as wykopController from './controllers/wykop'
import conversationRouter from './conversation'
import { csrfErrorHander, csrfProtection } from './csrf'
import logger from './logger'
import advertismentModel from './models/ads'
import confessionModel from './models/confession'
import DonationIntent from './models/donationIntent'
import replyModel from './models/reply'

const stripe = new Stripe(config.stripe.secret,
	{ apiVersion: '2020-08-27' })
const app = express()

app.enable('trust proxy')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use('/api', apiRouter)
app.use('/api2', apiv2Router)
app.use('/admin', adminRouter)
const frontendStaticPath = path.join(__dirname, '..', 'frontend', 'build', 'static')
const frontendIndex = path.join(__dirname, '..', 'frontend', 'build', 'index.html')
app.use('/admin2/static', express.static(frontendStaticPath))
app.use('/admin2/static/*', (req, res) => res.send(404))
app.use(['/admin2', '/admin2/*'], (req, res) => {
	res.sendFile(frontendIndex)
})
app.use('/conversation', conversationRouter)
app.use(auth(false))
app.set('view engine', 'pug')

app.get('/', csrfProtection, (req, res) => {
	res.render('index', { csrfToken: (req as any).csrfToken() })
})
app.post('/', csrfProtection, csrfErrorHander, async (req, res) => {
	const confession = new confessionModel()
	if (!req.body.text) {
		//TODO: should display error - user does not know what happened and why request failed
		return res.sendStatus(400)
	}
	confession.text = req.body.text || ''
	confession.IPAdress = req.ip
	confession.remotePort = req.connection.remotePort.toString()
	confession.embed = req.body.embed
	confession.tags = tagController.getTags(req.body.text)
	confession.auth = crypto.randomBytes(5).toString('hex')
	const action = await createAction(null, ActionType.NEW_ENTRY).save()
	confession.actions.push(action)
	confession.save()
		.then(() => {
			res.redirect(`confession/${confession._id}/${confession.auth}`)
		})
		.catch(_ => {
			res.sendStatus(500)
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
				}])
			.exec((err, confession) => {
				if (err) { return res.send(err) }
				if (!confession) { return res.sendStatus(404) }
				res.render('confession', { confession: confession })
			})
	}
})
app.get('/reply/:confessionid', csrfProtection, (req, res) => {
	confessionModel.findById(req.params.confessionid, (err, confession) => {
		if (err) { return res.sendStatus(404) }
		wykopController.getParticipants(confession.entryID).then(participants => {
			res.render('reply', { confession, participants, csrfToken: (req as any).csrfToken() })
		}).catch(_ => {
			res.render('reply', { confession, participants: [], csrfToken: (req as any).csrfToken() })
		})
	})
})
app.post('/reply/:confessionid', csrfProtection, csrfErrorHander, (req, res) => {
	confessionModel.findById(req.params.confessionid)
		.then((confession) => {
			if (!confession) { return res.sendStatus(404) }
			const reply = new replyModel()
			reply.text = req.body.text
			reply.IPAdress = req.ip
			reply.remotePort = req.connection.remotePort.toString()
			reply.embed = req.body.embed
			reply.alias = req.body.alias || aliasGenerator()
			if (reply.alias.trim() === confession.auth) {
				reply.alias = 'OP'
				reply.authorized = true
			}
			reply.auth = crypto.randomBytes(5).toString('hex')
			reply.parentID = confession._id
			return reply.save()
				.then(async () => {
					const action = await createAction(null, ActionType.NEW_REPLY, reply._id).save()
					confession.actions.push(action)
					return confession.save()
				})
				.then(() => {
					return res.render('reply', { success: true, reply, confession })
				})
		}).catch(err => {
			logger.error(err.toString())
			return res.sendStatus(500)
		})
})
app.get('/about', (req, res) => {
	res.render('about')
})
app.get('/contact', (req, res) => {
	res.render('contact')
})
app.get('/donate', (req, res) => {
	res.render('donate', {
		stripe_pub: config.stripe.publishable,
		return_url: `${config.siteURL}/donate/success`,
	})
})
app.get('/donate/success', (req, res) => {
	res.render('donate_success')
})
app.post('/donate', async (req, res) => {
	let amount = req.body.amount === 'custom' ? req.body['custom-amount'] : req.body.amount
	amount = Number(amount) * 100
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: 'pln',
			payment_method_types: ['p24'],
			receipt_email: req.body.email,
		})
		const localIntent = new DonationIntent({
			intentId: paymentIntent.id,
			email: req.body.email,
			username: req.body.username,
			message: req.body.message,
			amount,
		})
		localIntent.save().catch((err => {
			logger.error(err.toString())
			throw err
		}))
		res.render('donate', {
			client_secret: paymentIntent.client_secret,
			email: req.body.email.trim(),
			stripe_pub: config.stripe.publishable,
			return_url: `${config.siteURL}/donate/success`,
		})
	} catch (error) {
		logger.error(JSON.stringify(error))
		res.render('donate', { error: error.message })
	}
})
app.get('/link/:linkId/:from', function(req, res) {
	advertismentModel.findOne({ _id: req.params.linkId }, function(err, ad) {
		if (err || !ad) { return res.sendStatus(404) }
		ad.visits.push({ IPAdress: req.ip, from: req.params.from })
		ad.save()
		res.redirect(ad.out)
	})
})
export const server = http.createServer(app)

const _port = process.env.PORT || 8080

server.listen(_port, () => {
	logger.info(`Server started on port: ${_port} [${process.env.NODE_ENV}]`)
})
