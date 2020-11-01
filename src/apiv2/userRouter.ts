import { Router } from 'express'
import userModel from '../models/user'
import jwt from 'jsonwebtoken'
import config from '../config'
import { authentication } from './middleware/authentication'
import { RequestWithUser } from 'src/utils'
import { makeAPIResponse } from './apiV2'
export const userRouter = Router()

userRouter.get('/', authentication, (req: RequestWithUser, res) => {
	res.json(makeAPIResponse(res, req.user))
})

userRouter.post('/login', async (req, res) => {
	userModel.findOne({ username: req.body.username }).lean().then(user => {
		if (!user || user.password !== req.body.password) {
			return res.status(401).json(makeAPIResponse(res, null, { message: 'Invalid login or password' }))
		}
		if (user.password === req.body.password) {
			const { password, ...userWithoutPassword } = user

			const token = jwt.sign({
				...userWithoutPassword,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
			}, config.secret)
			res.cookie('token', token, { httpOnly: true })
			return res.json(makeAPIResponse(res, { token }))
		}
		return res.status(500)
	})
})
