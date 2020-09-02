import { Router, Request, Response } from 'express'
import userModel from './models/user'
import jwt from 'jsonwebtoken'
import config from './config'
import { RequestWithUser } from './utils'
import confessionModel from './models/confession'
import confession from './models/confession'
import logger from './logger'

function authentication(req: Request, res: Response, next) {
	const token = req.cookies.token
	let decoded
	try {
		decoded = jwt.verify(token, config.secret)
	} catch (error) {
		return res.status(401).json({ success: false, error: 'Unauthorized' })
	}
	(req as RequestWithUser).user = decoded
	next()

}

const apiRouter = Router()
apiRouter.get('/', (req, res) => {
	res.json('API v2')
})

const userRouter = Router()

userRouter.post('/login', async (req, res) => {
	userModel.findOne({ username: req.body.username }).lean().then(user => {
		if (!user || user.password !== req.body.password) {
			return res.status(401).json({ success: false, error: 'Invalid login or password' })
		}
		if (user.password === req.body.password) {
			const { password, ...userWithoutPassword } = user

			const token = jwt.sign({
				...userWithoutPassword,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
			}, config.secret)
			res.cookie('token', token, { httpOnly: true })
			res.json({ success: true, token })
		}
		return res.status(500)
	})
})

const confessionRouter = Router()
confessionRouter.use(authentication)
confessionRouter.get('/', async (req: RequestWithUser, res) => {
	confessionModel
		.find({}, ['_id', 'text', 'status', 'embed', 'auth', 'entryID', 'addedBy'])
		.sort({ _id: -1 })
		.lean()
		.limit(100)
		.then(confessions => {
			res.json(confessions)
		}).catch(err => {
			logger.error(err.toString())
			res.send(500)
		})
})

apiRouter.use('/users', userRouter)
apiRouter.use('/confessions', confessionRouter)

export default apiRouter
