import { Router } from 'express'
import userModel from '../models/user'
import jwt from 'jsonwebtoken'
import config from '../config'
export const userRouter = Router()

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
