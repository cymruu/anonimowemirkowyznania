import { Router } from 'express'
import jwt from 'jsonwebtoken'
const adminRouter = Router()
import config from './config'
import confessionModel from './models/confession'
import conversationModel from './models/conversation'
import auth from './controllers/authorization'
import { getFlagPermissions, checkIfIsAllowed, flipPermission, accessMiddlewareV1 } from './controllers/access'
import replyModel from './models/reply'
import userModel from './models/user'
import logger from './logger'
import { RequestWithUser } from './utils'
import DonationModel from './models/donation'
import donationIntent from './models/donationIntent'
import bodyBuildier from './controllers/bodyBuildier'
import { service } from './wykop'

adminRouter.get('/login', (req: RequestWithUser, res) => {
	res.render('./admin/login.pug', { user: {} })
})
adminRouter.post('/login', (req: RequestWithUser, res) => {
	userModel.findOne({
		username: req.body.username,
	}, { _id: 1, username: 1, password: 1, flags: 1 }).then(user => {
		if (!user) {
			return res.render('./admin/login.pug', { user: {}, error: 'Nie znaleziono uzytkownia' })
		}
		if (user.password === req.body.password) {
			delete user.password
			const token = jwt.sign({
				_id: user._id,
				username: user.username,
				flags: user.flags,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
			}, config.secret)
			res.cookie('token', token)
			res.redirect('/admin/confessions')
		} else {
			return res.render('./admin/login.pug', { user: {}, error: 'Błędne hasło' })
		}
	}).catch(err => {
		return res.sendStatus(500)
	})
})
adminRouter.get('/logout', (req: RequestWithUser, res) => {
	res.clearCookie('token')
	return res.render('./admin/login.pug', { user: {}, error: 'Wylogowano' })
})
adminRouter.use(auth(true))
adminRouter.get('/', accessMiddlewareV1('accessPanel'), (req: RequestWithUser, res) => {
	res.redirect('/admin/confessions')
})
adminRouter.get('/details/:confession_id', accessMiddlewareV1('viewDetails'), (req: RequestWithUser, res) => {
	confessionModel.findById(req.params.confession_id)
		.populate([
			{
				path: 'actions', options: { sort: { _id: -1 } },
				populate: { path: 'user', select: 'username' },
			},
			{ path: 'survey' },
		])
		.then(confession => {
			if (!confession) { return res.sendStatus(404) }
			confessionModel.find({ IPAdress: confession.IPAdress }, { _id: 1, status: 1 })
				.sort({ _id: -1 })
				.then(fromSameIP => {
					return [confession, fromSameIP]
				}).catch(err => {
					logger.error(err.toString())
					return [confession, []]
				}).then(([confession, fromSameIP]) => {
					res.render('./admin/details.pug', { user: req.user, confession, fromSameIP })
				})
		})
		.catch(err => {
			logger.error(err.toString())
		})
})
adminRouter
	.get('/details/:confession_id/ip',
		accessMiddlewareV1('viewDetails'),
		accessMiddlewareV1('viewIP'),
		(req: RequestWithUser, res) => {
			confessionModel.findById(req.params.confession_id, (err, confession) => {
				if (err) { return res.send(err) }
				if (!confession) { return res.sendStatus(404) }
				res.send(confession.IPAdress)
			})
		})
adminRouter.get('/confessions/:filter?', accessMiddlewareV1('accessPanel'), (req: RequestWithUser, res) => {
	let search = {}
	req.params.filter ? search = { status: req.params.filter } : search = {}
	confessionModel.find(search).sort({ _id: -1 }).limit(100).exec((err, confessions) => {
		if (err) { res.send(err) }
		res.render('./admin/confessions.pug', { user: req.user, confessions: confessions })
	})
})
adminRouter.get('/replies', accessMiddlewareV1('accessPanel'), (req: RequestWithUser, res) => {
	replyModel.find().populate('parentID').sort({ _id: -1 }).limit(100).exec((err, replies) => {
		if (err) { res.send(err) }
		res.render('./admin/replies.pug', { user: req.user, replies: replies })
	})
})
adminRouter.get('/messages/', accessMiddlewareV1('accessMessages'), (req: RequestWithUser, res) => {
	conversationModel.find(
		{ 'userID': req.user._id }, { _id: 1 },
		{ sort: { 'messages.time': -1 }, limit: 200 },
		(err, conversations) => {
			if (err) { return res.send(err) }
			res.render('./admin/messages.pug', { user: req.user, conversations })
		})
})
adminRouter.get('/donations', accessMiddlewareV1('accessDonations'), (req: RequestWithUser, res) => {
	Promise.all([DonationModel.find({}), donationIntent.find({})]).then(([donateList, donationIntents]) => {
		res.render('./admin/donations.pug', {
			user: req.user,
			donateList,
			donationIntents,
		})
	}).catch(err => {
		res.json(err)
	})
})
adminRouter.post('/donations', accessMiddlewareV1('addDonations'), async (req: RequestWithUser, res) => {
	const donation = new DonationModel(req.body)
	await donation.save().then(async () => {
		const entryBody = await bodyBuildier.getDonationEntryBody(donation)
		return service.Entries.Add({ body: entryBody, adultmedia: false })
	}).then(res => {
		donation.entryID = res.id
		return donation.save()
	}).then(() => {
		res.redirect('./donations')
	}).catch(err => {
		logger.error(err)
		res.send(err)
	})
})
adminRouter.get('/mods/', accessMiddlewareV1('accessModsList'), (req: RequestWithUser, res) => {
	userModel.find({}, { username: 1, flags: 1 }).lean().then(userList => {
		userList.forEach((user: any) => {
			user.permissions = getFlagPermissions(user.flags)
			return user
		})
		res.render('./admin/mods.pug', {
			user: req.user,
			userList: userList,
			canChangeUserPermissions: checkIfIsAllowed(req.user.flags, 'canChangeUserPermissions'),
		})
	}, err => {
		res.json({ err })
	})
})
adminRouter.get('/mods/flip/:targetId/:permission',
	accessMiddlewareV1('canChangeUserPermissions'),
	(req: RequestWithUser, res) => {
		userModel.findOne({ _id: req.params.targetId }, { username: 1, flags: 1 }).then(target => {
			target.flags = flipPermission(target.flags, req.params.permission)
			target.save().then(result => {
				res.redirect('/admin/mods')
			}, err => {
				res.json({ err })
			})
		}, err => {
			res.json({ err })
		})
	})
export default adminRouter
