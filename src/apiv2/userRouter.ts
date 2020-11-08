import { Router } from 'express'
import userModel from '../models/user'
import jwt from 'jsonwebtoken'
import config from '../config'
import { authentication } from './middleware/authentication'
import { RequestWithUser } from 'src/utils'
import { makeAPIResponse } from './apiV2'
import { accessMiddleware, flipPermission, getFlagPermissions } from '../controllers/access'
import user from '../models/user'
export const userRouter = Router()

userRouter.get('/me', authentication, (req: RequestWithUser, res) => {
	const permissions = getFlagPermissions(req.user.flags)
	res.json(makeAPIResponse(res, { user: req.user, permissions }))
})
userRouter.get('/',
	authentication,
	accessMiddleware('accessModsList'),
	(req, res) => {
		user.find({}, { username: 1, flags: 1 }).lean().then(userList => {
			const userPermissionList = userList.map((user: any) => {
				user.permissions = getFlagPermissions(user.flags)
				return user
			})
			return res.json(makeAPIResponse(res, userPermissionList))
		})
	})
userRouter.put('/:id/setPermission',
	authentication,
	accessMiddleware('canChangeUserPermissions'),
	(req, res) => {
		user.findOne({ _id: req.params.id }, { username: 1, flags: 1 }).then(target => {
			target.flags = flipPermission(target.flags, req.body.permission)
			target.save().then(result => {
				res.json(makeAPIResponse(res, { patchObject: { permissions: getFlagPermissions(target.flags) } }))
			}).catch(err => {
				res.status(500).json(makeAPIResponse(res, null, err.toString()))
			})
		})
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
			return res.json(makeAPIResponse(res, {
				...userWithoutPassword,
				token,
				permissions: getFlagPermissions(userWithoutPassword.flags),
			}))
		}
		return res.status(500)
	})
})
// TODO: should require a token to actually logout user
userRouter.get('/logout', (req, res) => {
	res.clearCookie('token')
	res.json(makeAPIResponse(res, {}))
})
